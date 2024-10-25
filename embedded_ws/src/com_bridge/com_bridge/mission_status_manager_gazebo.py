import os
import rclpy
from rclpy.node import Node
from common_msgs.msg import MissionStatus
from com_bridge.common_methods import get_robot_id, set_mission_status, get_mission_status
from com_bridge.common_enums import GlobalConst, RobotStatus, LogType
from com_bridge.log import LoggerNode

TIMER_PERIOD = 1.0
BATTERY_THRESHOLD = 30.0
DECREASE_BATTERY_LEVEL = 0.1
BATTERY_THRESHOLD = 0

class MissionStatusManagerGazebo(Node):
    def __init__(self):
        super().__init__("mission_manager_status_gazebo")
        self.battery_level = 100
        self.logger = LoggerNode()
        self.logger.log_message(LogType.INFO, 
            f"Mission manager Launched waiting for messages in {os.getenv('ROBOT')}"
        )
        self.mission_status_publisher = self.create_publisher(
            MissionStatus, f"{os.getenv('ROBOT')}/mission_status", GlobalConst.QUEUE_SIZE
        )
        self.timer = self.create_timer(TIMER_PERIOD, self.publish_mission_status)

    def decrease_battery_level(self):
        if self.battery_level > BATTERY_THRESHOLD:
            self.battery_level -= DECREASE_BATTERY_LEVEL
        round(self.battery_level)

    def publish_mission_status(self):
        try:
            self.decrease_battery_level()
            mission_status = MissionStatus()
            # TODO: get robot id from gazebo
            mission_status.robot_id = get_robot_id()
            mission_status.battery_level = int(self.battery_level)
            mission_status.robot_status = get_mission_status()
            if (
                mission_status.battery_level <= BATTERY_THRESHOLD
                and mission_status.robot_status != RobotStatus.LOW_BATTERY
            ):
                mission_status.robot_status = RobotStatus.LOW_BATTERY
                set_mission_status(RobotStatus.LOW_BATTERY)
                # TODO: call low battery callback here
            self.mission_status_publisher.publish(mission_status)
        except Exception as e:
            self.logger.log_message(LogType.ERROR, "Failed to publish mission status: " + str(e))


def main(args=None):
    rclpy.init(args=args)
    node = MissionStatusManagerGazebo()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == "__main__":
    main()
