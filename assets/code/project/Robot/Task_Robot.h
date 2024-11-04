#pragma once

#include "Libraries/Scheduler/Task.h"
//#include "Vehicle/Sentry_Gimbal/Robot/Robot.h"
class Robot;

class Task_Robot : public robo_lib::Task_Base
{
public:
	Task_Robot(Robot& robot0) : robo_lib::Task_Base(), robot(robot0)
	{

	}	
protected:
	Robot& robot;
};

