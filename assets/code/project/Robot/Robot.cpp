#include "./Robot.h"
#include "./Libraries/UART/UARTDriver.h"
#include "tim.h"

using namespace robo_lib;

/***********************************************************************
** 函 数 名： Robot::init()
** 函数说明： 机器人系统初始化
**---------------------------------------------------------------------
** 输入参数： 无
** 返回参数： 无
***********************************************************************/
void Robot::init()
{
  // 初始化各项参数
  params.initMotorsParams(robot_id);
	
  scheduler.init();
  
	//注册任务
  HAL_TIM_Base_Start_IT(&htim2);
  HAL_TIM_Base_Start_IT(&htim5);
	HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);  
  HAL_TIM_PWM_Start(&htim4, TIM_CHANNEL_3);  
  HAL_TIM_PWM_Start(&htim10, TIM_CHANNEL_1); 
  USART1_DMA_Tx_Init();
	
	/* 注册任务 */
	
}

/***********************************************************************
** 函 数 名： Robot::run()
** 函数说明： 机器人系统运行函数，此函数运行在主循环中
**---------------------------------------------------------------------
** 输入参数： 无
** 返回参数： 无
***********************************************************************/
void Robot::run()
{
  scheduler.run();
}
