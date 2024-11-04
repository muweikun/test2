#pragma once

#include "Libraries/Error/Error.h"
#include "./Params.h"
#include "Libraries/Scheduler/Scheduler.h"

#include "Modules/RoboBase/RoboBase.h"

#define CAN1_TX_BUF_LEN 20
#define CAN2_TX_BUF_LEN 20

class Robot : public RoboBase
{
	public:
	virtual void init(void) override;
	virtual void run(void) override;
	
	Params get_Params()
	{
		return params;
	}
	
	protected:
	Params params;
	uint8_t robot_id = 0;
};
