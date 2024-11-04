cmake_minimum_required(VERSION 3.8)
project(robo_utils)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)
find_package(geometry_msgs REQUIRED)

rosidl_generate_interfaces(robo_utils
  # offboardlink msgs
  "msg/AmmoDebug.msg"
  "msg/ChassisStrategy.msg"
  "msg/ChassisVelCommand.msg"
  "msg/GimbalConstantAimShootCommand.msg"
  "msg/ChassisVelYawRateCommand.msg"
  "msg/Heartbeat.msg"
  "msg/CommandData.msg"
  "msg/GimbalPIDDebug.msg"
  "msg/AutoAimInfo.msg"
  "msg/HeartbeatReply.msg"
  "msg/ReferenceDataMini.msg"
  "msg/RobotAroundInformation.msg"
  "msg/MinipcHeartbeat.msg"
  "msg/Target.msg"
  "msg/ShootDebug.msg"
  "msg/GimbalSingleAimShootCommand.msg"
  
  # other msgs
  "msg/Armor.msg"
  "msg/Armors.msg"
  "msg/DetectorObject.msg"
  "msg/DetectorObjects.msg"
  "msg/ImageReproject.msg"
  "msg/ImageReprojectPack.msg"
  "msg/Robot.msg"
  "msg/Robots.msg"

  DEPENDENCIES
    std_msgs
    geometry_msgs
)

ament_export_dependencies(rosidl_default_generators)
ament_export_dependencies(rosidl_default_runtime)

ament_package()
