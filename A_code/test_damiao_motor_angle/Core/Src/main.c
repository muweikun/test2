/* USER CODE BEGIN Header */
/**
 ******************************************************************************
 * @file           : main.c
 * @brief          : Main program body
 ******************************************************************************
 * @attention
 *
 * Copyright (c) 2023 STMicroelectronics.
 * All rights reserved.
 *
 * This software is licensed under terms that can be found in the LICENSE file
 * in the root directory of this software component.
 * If no LICENSE file comes with this software, it is provided AS-IS.
 *
 ******************************************************************************
 */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "can.h"
#include "dma.h"
#include "usart.h"
#include "gpio.h"
#include <stdint.h>
#include "tim.h"
/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */

#include "drv_bsp.h"

#include "dvc_serialplot.h"
#include "dvc_motor.h"
#include "dvc_motor_dm.h"



/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */

Class_Serialplot serialplot;
Class_Motor_DM_Normal motor1;
Class_Motor_DM_Normal motor2;
Class_Motor_DM_Normal motor3;
Class_Motor_DM_Normal motor4;
Class_Motor_DM_Normal motor5;
// Class_Motor_C620 motor_3508;
// Class_Motor_GM6020 motor_6020;

// float Target_Angle_3508, Now_Angle_3508, Target_Omega_3508, Now_Omega_3508;
// float Target_Angle_6020, Now_Angle_6020, Target_Omega_6020, Now_Omega_6020, Target_Current_6020, Now_Current_6020;

uint32_t Counter = 0;

static char Variable_Assignment_List[][SERIALPLOT_RX_VARIABLE_ASSIGNMENT_MAX_LENGTH] = {
    //电机调PID
    "po",
    "io",
    "do",
    "fo",
};

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */

/**
 * @brief CAN报文回调函数
 *
 * @param Rx_Buffer CAN接收的信息结构体
 */
void CAN_Motor_Call_Back(Struct_CAN_Rx_Buffer *Rx_Buffer)
{
    switch (Rx_Buffer->Header.StdId)
    {
        // case (0x201):
        // {
        //     motor_3508.CAN_RxCpltCallback(Rx_Buffer->Data);
        // }
        // break;
        // case (0x205):
        // {
        //     motor_6020.CAN_RxCpltCallback(Rx_Buffer->Data);
        // }
        // break;
        case (0x01):
        {
					
            motor1.CAN_RxCpltCallback(Rx_Buffer->Data);
						break;
        }
				case (0x03):
        {
					
            motor2.CAN_RxCpltCallback(Rx_Buffer->Data);
						break;
        }
				case (0x05):
        {
					
            motor3.CAN_RxCpltCallback(Rx_Buffer->Data);
						break;
        }
				case (0x07):
        {
					
            motor4.CAN_RxCpltCallback(Rx_Buffer->Data);
						break;
        }
				case (0x09):
        {
					
            motor5.CAN_RxCpltCallback(Rx_Buffer->Data);
						break;
        }
				
				
    }
}

/**
 * @brief HAL库UART接收DMA空闲中断
 *
 * @param huart UART编号
 * @param Size 长度
 */
void UART_Serialplot_Call_Back(uint8_t *Buffer, uint16_t Length)
{
    serialplot.UART_RxCpltCallback(Buffer);
    switch (serialplot.Get_Variable_Index())
    {
        // 电机调PID
        // case(0):
        // {
        //     motor_3508.PID_Omega.Set_K_P(serialplot.Get_Variable_Value());
        // }
        // break;
        // case(1):
        // {
        //     motor_3508.PID_Omega.Set_K_I(serialplot.Get_Variable_Value());
        // }
        // break;
        // case(2):
        // {
        //     motor_3508.PID_Omega.Set_K_D(serialplot.Get_Variable_Value());
        // }
        // break;
        // case(3):
        // {
        //     motor_3508.PID_Omega.Set_K_F(serialplot.Get_Variable_Value());
        // }
        // break;
    }
}

 //state = 0--在指定位置悬停，= 1--下去取垃圾，2--放垃圾到指定垃圾箱
struct arm_State
{
		uint8_t ID;
    float angle[5];
    float speed_rad; // 确保拼写正确
};  // 注意这里的分号

uint8_t ID_now;
uint8_t ID_last;
uint8_t state_choose_flag = 100;//判断要选取12个位置中的哪一个
uint8_t bin_choose_flag = 1;//选取4个垃圾箱中的一个
float set_angle[5];
float set_speed[5] = {PI/4,PI/4,PI/4,PI/4,PI/4};
uint8_t arm_state_lock; //每次状态变化中的过程锁
uint8_t arm_processing_lock;//机械臂正在运行的过程锁
uint8_t arm_state_process = 0;//每次抓取的机械臂变化过程
uint8_t turn_flag = 0;

uint8_t  RecieveBuffer[1]={0};//暂存接收到的字符
uint8_t data_receive2[4]= {0,100,100,100};
uint8_t  CO2Buffer[4];//收到的数据存放处
uint8_t  RxLine=0; //记录接收数据长度
uint8_t is_moving;
uint8_t ID_;
// 这里声明了一个包含12个arm_State结构体的数组
//												  ID	   angle	  speed_rad 
arm_State state[18] = {
    {0, {1.636, 0.2, 0.147, 1.817, 0.2}, PI/4}, // ID = 0，复位状态
    {1, {-22.93 + 25 , -24.79 + 25., -24.15 + 25 , -23.49 + 25 , -24.86 + 25}, PI/4}, // ID = 1，垃圾桶1
    {2, {-23.78 + 25 , -24.49 + 25 , -24.13 + 25 , -23.51 + 25 , -24.88 + 25}, PI/4}, // ID = 2，垃圾桶2
    {3, {-22.66 + 25 , -24.77 + 25 , -24.35 + 25 , -23.60 + 25 , -24.88 + 25}, PI/4}, // ID = 3，垃圾桶3
    {4, {-24.04 + 25 , -24.77 + 25 , -24.31 + 25 , -23.68 + 25 , -24.96 + 25}, PI/4}, // ID = 4，垃圾桶4
    {5, {-23.03 + 25 , -24.50 + 25 , -24.75 + 25 , -23.03 + 25 , 0.2}, PI/4}, // ID = 14，空间10
    {6, {-23.39 + 25 , -24.50 + 25 , -24.78 + 25 , -23.04 + 25 , 0.2}, PI/4}, // ID = 15，空间11
    {7, {-23.69 + 25 , -24.52 + 25 , -24.74 + 25 , -23.04 + 25 , 0.2}, PI/4}, // ID = 16，空间12
    {8, {-23.12 + 25 , -24.44 + 25 , -24.57 + 25 , -23.12 + 25 , -24.55 + 25}, PI/4}, // ID = 11，空间7
    {9, {-23.34 + 25 , -24.47 + 25 , -24.61 + 25 , -23.09 + 25 , -24.74 + 25}, PI/4}, // ID = 12，空间8
    {10, {-23.58 + 25 , -24.46 + 25 , -24.60 + 25 , -23.09 + 25 , 0.2}, PI/4}, // ID = 13，空间9		
    {11, {-23.17 + 25 , -24.39 + 25 , -24.44 + 25 , -23.12 + 25 , -24.51 + 25}, PI/4}, // ID = 8，空间4
    {12, {-23.36 + 25 , -24.40 + 25 , -24.45 + 25 , -23.11 + 25 , -24.71 + 25}, PI/4}, // ID = 9，空间5
    {13, {-23.56 + 25 , -24.39 + 25 , -24.43 + 25 , -23.15 + 25 , -24.97 + 25}, PI/4}, // ID = 10，空间6		
    {14, {-23.24 + 25 , -24.32 + 25 , -24.25 + 25 , -23.23 + 25 , -24.68 + 25}, PI/4}, // ID = 5，空间1
    {15, {-23.37 + 25 , -24.31 + 25 , -24.23 + 25 , -23.28 + 25 , -24.82 + 25}, PI/4}, // ID = 6，空间2
    {16, {-23.54 + 25 , -24.32 + 25 , -24.25 + 25 , -23.23 + 25 , -24.82 + 25}, PI/4}, // ID = 7，空间3		
    {17, {-23.36 + 25 , -24.80 + 25 , -24.24 + 25 , -23.72 + 25 , 0.2}, PI/4}  // ID = 17，悬空
};

void set_motors_angle(arm_State* arm_state)
{
	set_angle[0] = arm_state->angle[0];
	set_angle[1] = arm_state->angle[1];
	set_angle[2] = arm_state->angle[2];
	set_angle[3] = arm_state->angle[3];
	set_angle[4] = arm_state->angle[4];	
}
void set_motors_speed(arm_State* arm_state)
{
	set_speed[0] = arm_state->speed_rad;
	set_speed[1] = arm_state->speed_rad;
	set_speed[2] = arm_state->speed_rad;
	set_speed[3] = arm_state->speed_rad;
	set_speed[4] = arm_state->speed_rad;
}

void set_PWM1(uint8_t state)
{
	if(state == 0)
	{
		__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_1, 785);//关
	}
	
	if(state == 1)
	{
		__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_1, 1250);//开
	}
}

void set_PWM2(uint8_t state)
{
	if(state == 0)
	{
		__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_2, 775);//关
	}
	
	if(state == 1)
	{
		__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_2, 250);//开
	}
}


void set_PWM3(uint8_t state)
{
	if(state == 0)
	{
		__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_3, 1095);//关
	}
	
	if(state == 1)
	{
		__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_3, 750);//开
	}
}

void motor_state_chage(float* set_angle,float* set_speed)
{
		    static uint32_t Counter_[5] = {0};						
				if(Counter_[0]++ > 103)
				{
					Counter_[0] = 0;
	      motor1.Set_Control_Angle(set_angle[0]);
        motor1.Set_Control_Omega(set_speed[0]);
			  motor1.TIM_Send_PeriodElapsedCallback();
			 
				}
				
				if(Counter_[1]++ > 107)
				{		
					Counter_[1] = 0;					
	      motor2.Set_Control_Angle(set_angle[1]);
        motor2.Set_Control_Omega(set_speed[1]);
			  motor2.TIM_Send_PeriodElapsedCallback();
				}
				if(Counter_[2]++ > 110)
				{	
					Counter_[2] = 0;					
	      motor3.Set_Control_Angle(set_angle[2]);
        motor3.Set_Control_Omega(set_speed[2]);
			  motor3.TIM_Send_PeriodElapsedCallback();
				}
				
				if(Counter_[3]++ > 130)
				{		
					Counter_[3] = 0;					
	      motor4.Set_Control_Angle(set_angle[3]);
        motor4.Set_Control_Omega(set_speed[3]);
			  motor4.TIM_Send_PeriodElapsedCallback();
				}
				
				if(Counter_[4]++ > 170)
				{			
					Counter_[4] = 0;				
				if(turn_flag == 0)
				{					
					motor5.Set_Control_Angle(set_angle[4]);
				}
				if(turn_flag == 1 && state_choose_flag != 9 && state_choose_flag != 10 && state_choose_flag != 11
					 &&( arm_state_process == 1 || arm_state_process == 2 || arm_state_process == 3 )
				)
				{					
					motor5.Set_Control_Angle(0.2 + PI/2);
				}
				else 
				{					
					motor5.Set_Control_Angle(set_angle[4]);
				}
        motor5.Set_Control_Omega(set_speed[4]);
			  motor5.TIM_Send_PeriodElapsedCallback();
				}

			
			        // 保持存活
        static uint32_t Counter_KeepAlive[5] = {0};
        if (Counter_KeepAlive[0]++ > 100)
        {
            Counter_KeepAlive[0] = 0;
            
            motor1.TIM_Alive_PeriodElapsedCallback();
        }

        if (Counter_KeepAlive[1]++ > 105)
        {
            Counter_KeepAlive[1] = 0;
            
            motor2.TIM_Alive_PeriodElapsedCallback();
        }

        if (Counter_KeepAlive[2]++ > 110)
        {
            Counter_KeepAlive[2] = 0;
            
            motor3.TIM_Alive_PeriodElapsedCallback();
        }

        if (Counter_KeepAlive[3]++ > 120)
        {
            Counter_KeepAlive[3] = 0;
            
            motor4.TIM_Alive_PeriodElapsedCallback();
        }

        if (Counter_KeepAlive[4]++ > 130)
        {
            Counter_KeepAlive[4] = 0;
            
            motor5.TIM_Alive_PeriodElapsedCallback();
        }		
}

void arm_control_once(uint8_t ID)//本次的状态ID，机械臂锁
{

			 if(arm_state_process == 0 && arm_state_lock != 0)
			 {  
				 	  ID_ = ID + 5;
				 //控制机械臂悬空，并打开夹爪
					set_motors_angle(&state[17]);
					set_motors_angle(&state[17]);
				  set_PWM1(1);
				  set_PWM2(1);
				  set_PWM3(1);
				 
					arm_state_process = 1;//进入下一个状态
					arm_state_lock = 0;//锁上
				  arm_processing_lock = 1;//锁上
			 }
			 if(arm_state_process == 1 && arm_state_lock != 0)
			 {
				 //控制机械臂开始抓垃圾
					set_motors_angle(&state[ID_]);
					set_motors_angle(&state[ID_]);
				 
					arm_state_process = 2;//进入下一个状态
					 arm_state_lock = 0;//锁上
			 }
			 if(arm_state_process == 2 && arm_state_lock != 0)
			 {
				 //控制机械臂开始抓垃圾
				 //控制舵机抓垃圾
					set_motors_angle(&state[ID_]);
					set_motors_angle(&state[ID_]);
				 
				  set_PWM3(0);
				 
					arm_state_process = 3;//进入下一个状态
					 arm_state_lock = 0;//锁上
			 }	 

			 if(arm_state_process == 3 && arm_state_lock != 0)
			 {
				 //控制机械臂抓到垃圾之后悬空
				 
					set_motors_angle(&state[17]);
					set_motors_angle(&state[17]);
				 
					arm_state_process = 4;//进入下一个状态
					arm_state_lock = 0;//锁上
			 }		
			 if(arm_state_process == 4 && arm_state_lock != 0)
			 {
				 //控制机械臂悬空之后放到垃圾桶里
				 
				 if(bin_choose_flag>3)bin_choose_flag = 3;
				 if(bin_choose_flag<0)bin_choose_flag = 0;
					set_motors_angle(&state[bin_choose_flag]);
					set_motors_angle(&state[bin_choose_flag]);
				 
					arm_state_process = 5;//进入下一个状态
					arm_state_lock = 0;//锁上
			 }	
			 
			 if(arm_state_process == 5 && arm_state_lock != 0)
			 {
				 //打开舵机放到垃圾桶里
				 
				  set_PWM3(1);
				 
					arm_state_process = 6;//进入下一个状态
					arm_state_lock = 0;//锁上
			 }	 
				if(arm_state_process == 6 && arm_state_lock != 0)
			 {
				 //放完垃圾之后，回到复位状态
					set_motors_angle(&state[0]);
					set_motors_angle(&state[0]);		 
				 
				 
					arm_state_process = 7;//回到复位状态
					arm_state_lock = 0;//锁上
			 }	
				if(arm_state_process == 7 && arm_state_lock != 0)
			 {
				 
				 	set_PWM3(0);
				 	set_PWM1(0);
				  set_PWM2(0);
				  state_choose_flag = 100;
					arm_state_process = 0;//回到复位状态
					arm_state_lock = 0;	
				  is_moving = 0;
				 
				 	data_receive2[1] = 100;
			    data_receive2[2] = 100;
			    data_receive2[3] = 100;
			 }				 
			 
			 static uint32_t cnt;
			 if(arm_state_process != 0)
			 {
					cnt++;
			 } 
				 else 
				 {
					 cnt = 0;
				 }
			 if(cnt >=  2000 && arm_state_lock== 0)//延迟3秒
			 {
				 arm_state_lock = 1;//开锁
				 cnt = 0;
			 }
			 
			 motor_state_chage(set_angle ,set_speed);
}

/* USER CODE END 0 */
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{               
	if (huart->Instance == USART6)
    {
        RxLine++;
        
        CO2Buffer[RxLine-1]=RecieveBuffer[0];
        
        if(RxLine == 1)
        {
            if (RecieveBuffer[0]==0xAA)  //数据第一字节，根据实际情况修改
            {
                RxLine = 1;
							data_receive2[0] = RecieveBuffer[0];
            }
            else
            {
                RxLine = 0;               
            }
        }
        
        else if (RxLine == 2)  
        {
            RxLine=2;	
            data_receive2[1] = RecieveBuffer[0];
        }

        else if (RxLine == 3)
        {
            RxLine=3;	
            data_receive2[2] = RecieveBuffer[0];           
        }
        else if (RxLine == 4)
        {
            RxLine=0;	
            data_receive2[3] = RecieveBuffer[0];           
        }        
				
        RecieveBuffer[0]=0;
        HAL_UART_Receive_IT(&huart6, (uint8_t *)RecieveBuffer, 1);
    }
}
/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{

  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_DMA_Init();
  MX_CAN1_Init();
//  MX_USART2_UART_Init();
	MX_USART6_UART_Init();
	 MX_TIM2_Init();
  /* USER CODE BEGIN 2 */
	    if(HAL_UART_Receive_IT(&huart6, (uint8_t *)RecieveBuffer, 1) != HAL_OK)
    {
        // 错误处理
        Error_Handler();
    }
	
	HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_1);
	HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_2);
	HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_3);
	
//			复制下去用
			__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_1, 785);	//关	
//	    HAL_Delay(1000);
//	    __HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_2, 250);	//开，得调
//		  HAL_Delay(1000);
			__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_2, 775);		
//		   HAL_Delay(1000);
//		  __HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_2, 250);	
//			 HAL_Delay(1000);
//			
			__HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_3, 1095);	//夹爪	
//		   HAL_Delay(1000);
//		  __HAL_TIM_SetCompare(&htim2, TIM_CHANNEL_3, 1050);	
//			 HAL_Delay(1000);
  /* USER CODE BEGIN 2 */

    BSP_Init(BSP_DC24_LU_ON | BSP_DC24_LD_ON | BSP_DC24_RU_ON | BSP_DC24_RD_ON);
    CAN_Init(&hcan1, CAN_Motor_Call_Back);
//    UART_Init(&huart2, UART_Serialplot_Call_Back, SERIALPLOT_RX_VARIABLE_ASSIGNMENT_MAX_LENGTH);

 //   serialplot.Init(&huart2, 6, (char **)Variable_Assignment_List);

    // motor_3508.PID_Omega.Init(1200.0f, 3000.0f, 0.0f, 0.0f, 2500.0f, 2500.0f);
    // motor_3508.Init(&hcan1, CAN_Motor_ID_0x201, Control_Method_OMEGA);

    // motor_6020.PID_Torque.Init(0.8f, 100.0f, 0.0f, 0.0f, 30000.0f, 30000.0f);
    // motor_6020.PID_Omega.Init(500.0f, 2000.0f, 0.0f, 0.0f, 1000.0f, 1000.0f);
    // motor_6020.PID_Angle.Init(12.0f, 0.0f, 0.0f, 0.0f, 4.0f * PI, 4.0f * PI);
    // motor_6020.Init(&hcan1, CAN_Motor_ID_0x205, Control_Method_ANGLE);

    motor1.Init(&hcan1, 0x01, 0x02, Motor_DM_Control_Method_NORMAL_ANGLE_OMEGA);
		motor2.Init(&hcan1, 0x03, 0x04, Motor_DM_Control_Method_NORMAL_ANGLE_OMEGA);
    motor3.Init(&hcan1, 0x05, 0x06, Motor_DM_Control_Method_NORMAL_ANGLE_OMEGA);
		motor4.Init(&hcan1, 0x07, 0x08, Motor_DM_Control_Method_NORMAL_ANGLE_OMEGA);
		motor5.Init(&hcan1, 0x09, 0x10, Motor_DM_Control_Method_NORMAL_ANGLE_OMEGA);
	

  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
    while (1)
    {
			if(is_moving == 0)
			{
			 state_choose_flag = data_receive2[1];
			 turn_flag = data_receive2[2];
			 bin_choose_flag = data_receive2[3];
			 arm_state_lock = 1;
			}
			
		if(state_choose_flag >= 0 && state_choose_flag <= 11)
		{
			is_moving = 1;
			arm_control_once(state_choose_flag);
		}
		
		if(state_choose_flag == 100)
		{
			set_motors_angle(&state[0]);
			set_motors_speed(&state[0]);		
			motor_state_chage(set_angle ,set_speed);			
		}		
						
				
//		    static uint32_t Counter_[5] = {0};						
//				if(Counter_[0]++ > 103)
//				{
//					Counter_[0] = 0;
//	      motor1.Set_Control_Angle(set_angle[0]);
//        motor1.Set_Control_Omega(set_speed[0]);
//			  motor1.TIM_Send_PeriodElapsedCallback();
//			 
//				}
//				
//				if(Counter_[1]++ > 107)
//				{		
//					Counter_[1] = 0;					
//	      motor2.Set_Control_Angle(set_angle[1]);
//        motor2.Set_Control_Omega(set_speed[1]);
//			  motor2.TIM_Send_PeriodElapsedCallback();
//				}
//				if(Counter_[2]++ > 110)
//				{	
//					Counter_[2] = 0;					
//	      motor3.Set_Control_Angle(set_angle[2]);
//        motor3.Set_Control_Omega(set_speed[2]);
//			  motor3.TIM_Send_PeriodElapsedCallback();
//				}
//				
//				if(Counter_[3]++ > 130)
//				{		
//					Counter_[3] = 0;					
//	      motor4.Set_Control_Angle(set_angle[3]);
//        motor4.Set_Control_Omega(set_speed[3]);
//			  motor4.TIM_Send_PeriodElapsedCallback();
//				}
//				
//				if(Counter_[4]++ > 170)
//				{			
//					Counter_[4] = 0;					
//	      motor5.Set_Control_Angle(set_angle[4]);
//        motor5.Set_Control_Omega(set_speed[4]);
//			  motor5.TIM_Send_PeriodElapsedCallback();
//				}

//			
//			        // 保持存活
//        static uint32_t Counter_KeepAlive[5] = {0};
//        if (Counter_KeepAlive[0]++ > 100)
//        {
//            Counter_KeepAlive[0] = 0;
//            
//            motor1.TIM_Alive_PeriodElapsedCallback();
//        }

//        if (Counter_KeepAlive[1]++ > 105)
//        {
//            Counter_KeepAlive[1] = 0;
//            
//            motor2.TIM_Alive_PeriodElapsedCallback();
//        }

//        if (Counter_KeepAlive[2]++ > 110)
//        {
//            Counter_KeepAlive[2] = 0;
//            
//            motor3.TIM_Alive_PeriodElapsedCallback();
//        }

//        if (Counter_KeepAlive[3]++ > 120)
//        {
//            Counter_KeepAlive[3] = 0;
//            
//            motor4.TIM_Alive_PeriodElapsedCallback();
//        }

//        if (Counter_KeepAlive[4]++ > 130)
//        {
//            Counter_KeepAlive[4] = 0;
//            
//            motor5.TIM_Alive_PeriodElapsedCallback();
//        }				

        // 串口绘图显示内容
        
//        float status = motor_j4310.Get_Control_Status();
//        float control_angle = motor_j4310.Get_Control_Angle();
//        float now_angle = motor_j4310.Get_Now_Angle();
//        float control_omega = motor_j4310.Get_Control_Omega();
//        float now_omega = motor_j4310.Get_Now_Omega();
//        float control_torque = motor_j4310.Get_Control_Torque();
//        float now_torque = motor_j4310.Get_Now_Torque();
//        float temperature_mos = motor_j4310.Get_Now_MOS_Temperature();
//        float temperature_rotor = motor_j4310.Get_Now_Rotor_Temperature();
//        float k_p = motor_j4310.Get_K_P();
//        float k_d = motor_j4310.Get_K_D();
//        serialplot.Set_Data(11, &status, &control_angle, &now_angle, &control_omega, &now_omega, &control_torque, &now_torque, &temperature_mos, &temperature_rotor, &k_p, &k_d);
//        serialplot.TIM_Write_PeriodElapsedCallback();

        //输出数据到电机
        // motor_3508.TIM_PID_PeriodElapsedCallback();
        // motor_6020.TIM_PID_PeriodElapsedCallback();

        //通信设备回调数据
//        TIM_CAN_PeriodElapsedCallback();
//        TIM_UART_PeriodElapsedCallback();

        //延时1ms
        HAL_Delay(0);
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
    }
  /* USER CODE END 3 */
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Configure the main internal regulator output voltage
  */
  __HAL_RCC_PWR_CLK_ENABLE();
  __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLM = 6;
  RCC_OscInitStruct.PLL.PLLN = 180;
  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV2;
  RCC_OscInitStruct.PLL.PLLQ = 4;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  /** Activate the Over-Drive mode
  */
  if (HAL_PWREx_EnableOverDrive() != HAL_OK)
  {
    Error_Handler();
  }

  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV4;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV2;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_5) != HAL_OK)
  {
    Error_Handler();
  }
}

/* USER CODE BEGIN 4 */

/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
    /* User can add his own implementation to report the HAL error return state */
    __disable_irq();
    while (1)
    {
    }
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
    /* User can add his own implementation to report the file name and line number,
       ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
