#ifndef PARAMS_H
#define PARAMS_H

#include <stdint.h>

typedef struct _Control_Tasks_Interval_t
{
  
} Control_Tasks_Interval_t;


typedef struct _Init_Params_t
{
  Control_Tasks_Interval_t control_tasks_interval;
} Init_Params_t;

class Robot;
class Params
{
public:

  Params(){}
  void initMotorsParams(uint8_t ROBOT_ID);
  Init_Params_t device_params;
	
protected:
	

};




#endif