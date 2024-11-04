#include "./Robot.h"
#include "./Libraries/UART/UARTDriver.h"
#include "tim.h"

using namespace robo_lib;

/***********************************************************************
** �� �� ���� Robot::init()
** ����˵���� ������ϵͳ��ʼ��
**---------------------------------------------------------------------
** ��������� ��
** ���ز����� ��
***********************************************************************/
void Robot::init()
{
  // ��ʼ���������
  params.initMotorsParams(robot_id);
	
  scheduler.init();
  
	//ע������
  HAL_TIM_Base_Start_IT(&htim2);
  HAL_TIM_Base_Start_IT(&htim5);
	HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);  
  HAL_TIM_PWM_Start(&htim4, TIM_CHANNEL_3);  
  HAL_TIM_PWM_Start(&htim10, TIM_CHANNEL_1); 
  USART1_DMA_Tx_Init();
	
	/* ע������ */
	
}

/***********************************************************************
** �� �� ���� Robot::run()
** ����˵���� ������ϵͳ���к������˺�����������ѭ����
**---------------------------------------------------------------------
** ��������� ��
** ���ز����� ��
***********************************************************************/
void Robot::run()
{
  scheduler.run();
}
