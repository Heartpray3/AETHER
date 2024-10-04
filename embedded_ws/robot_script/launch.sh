MAIN_BRANCH="develop"
AUDIO_DEVICE_ID=$(pactl list short sinks | grep "USB_PnP_Audio_Device" | awk '{print $1}')
sudo chown nvidia:nvidia /dev/ttyTHS1 &&
if [ -d ~/geppetto/ ]; then
    cd ~/geppetto/; git switch $MAIN_BRANCH; git pull
else
    cd ~; git clone https://loic-hpp:glpat-v9Qt8vbw2zoY-stynsRH@gitlab.com/polytechnique-montr-al/inf3995/20243/equipe-107/geppetto.git
    cd ~/geppetto/; git switch $MAIN_BRANCH; git pull
fi
cd ~/limo_ws; colcon build; source install/setup.bash 
cd ~/limo_ws/src/limo_ros2; ros2 launch limo_bringup limo_start.launch.py &
cd ~/geppetto/embedded_ws/; colcon build;  source install/setup.bash;  ros2 run com_bridge com_serv &
source install/setup.bash; ros2 run rosbridge_server rosbridge_websocket
pactl set-default-sink $AUDIO_DEVICE_ID