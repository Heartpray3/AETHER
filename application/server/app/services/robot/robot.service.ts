import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { EndMissionRequest, RobotRequest, StartMissionRequest, MessageOperation } from '@common/interfaces/request.interface';
import { Command, Operation, Topic, TopicType } from '@common/enums/SocketsEvents';

@Injectable()
export class RobotService {
    private readonly logger: Logger = new Logger(RobotService.name);
    private robotIp: string;
    private ws: WebSocket;
    private isSocketOpen: boolean = false;
    constructor(robotIp: string) {
        this.robotIp = robotIp;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(`ws://${this.robotIp}:${process.env.ROS_BRIDGING_PORT}`);

        this.ws.onopen = () => {
            this.isSocketOpen = true;
            this.logger.log(`Connection established to robot ${this.robotIp}`);
            this.isSocketOpen = true;
        };

        // TODO put types for the messages and errors that will come from robots
        this.ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            this.logger.debug(`Message received from robot to ${this.robotIp}`, data);
        };

        this.ws.onerror = (error) => {
            this.logger.log(`Error occurred on robot  ${this.robotIp}: ${error.message}`);
            this.isSocketOpen = false;
        };

        this.ws.onclose = () => {
            this.logger.log(`Connection to robot ${this.robotIp} closed`);
        };
    }

    subscribeToTopic(topicName: Topic, topicType: TopicType) {
        if (!this.isSocketOpen) this.connect();

        const subscribeMessage: MessageOperation = {
            op: Operation.subscribe,
            topic: topicName,
            type: topicType,
        };
        this.ws.send(JSON.stringify(subscribeMessage));
        this.logger.log(`Subscription to topic ${topicName} of robot ${this.robotIp}`);
    }

    publishToTopic(topicName: Topic, topicType: TopicType, message: RobotRequest) {
        if (!this.isSocketOpen) {
            this.connect();
        }
        const publishMessage: MessageOperation = {
            op: Operation.publish,
            topic: topicName,
            type: topicType,
            msg: message,
        };
        this.ws.send(JSON.stringify(publishMessage));
        this.logger.log(`Publish message to topic ${topicName} of robot ${this.robotIp}:`);
    }

    // TODO: send real info comming from Frontend, to do so, needs parameters for this function and the one under
    startMission() {
        this.publishToTopic(Topic.start_mission, TopicType.start_mission, {
            command: Command.StartMission,
            mission_details: {
                orientation: 0.0,
                position: {
                    x: 0.0,
                    y: 0.0,
                },
            },
            timestamp: new Date().toISOString(),
        } as StartMissionRequest);
    }

    stopMission() {
        this.publishToTopic(Topic.stop_mission, TopicType.stop_mission, {
            command: Command.EndMission,
            timestamp: new Date().toISOString(),
        } as EndMissionRequest);
    }

    identify() {
        this.logger.log('Identify robot command received from client');
        this.publishToTopic(Topic.identify_command, TopicType.identify_robot, {
            command: Command.Identify,
            timestamp: new Date().toISOString(),
        } as RobotRequest);
    }
}
