/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2024 STMicroelectronics.
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
#include "dma.h"
#include "tim.h"
#include "usart.h"
#include "gpio.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "referee_system.h"
#include "check_rubbish.h"
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */
extern DMA_HandleTypeDef hdma_usart6_rx;
/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
#define LONG  5
#define ABS(x) ((x) < 0 ? -(x) : (x))
#define  CONSTRAIN 50


MeasurementData ultrasound1={0,0,0.0};
MeasurementData ultrasound2={0,0,0.0};
MeasurementData ultrasound3={0,0,0.0};
MeasurementData ultrasound4={0,0,0.0};
// 划分方框起始坐标
#define x_start 22.5
#define y_start 23.75

//坐标改变值
#define delta_x 45
#define delta_y 47.5

//判定限定值，判断是否属于该框内,是距离的平方
#define pd 1089

uint8_t FLAG =0;


/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
uint8_t Rxcompleted = RESET;
uint8_t Pbuffer[LONG];
uint8_t Rxbuffer[LONG];
/* USER CODE END Includes */
uint32_t time1=0;                //解析接受数据的分频计时
uint32_t time2=0;                //判断数值稳定的分频
uint16_t last_x=0;              //上一次接收到的坐标值，用于判断是否稳定
uint16_t last_y=0;              //上一次接收到的坐标值，用于判断是否稳定
uint8_t to_A[4];              // 发送给A板的数据，由一个位置标志和，姿态标志拼接而成
uint8_t to_b=0x01;
float center_x;                 // 遍历循环的中计算出的方框中心坐标
float center_y;                  // 遍历循环的中计算出的方框中心坐标

float distance;

extern target target_position;

/* USER CODE END PD */
float square_sum(float num1, float num2) {
    return (num1 * num1) + (num2 * num2);  // 加上括号，避免运算优先级问题
}


/* USER CODE END PTD */
//-------------------------------------------------------开启蜂鸣器-------------------------------------------------------------------------
void start_puzzer(void){
    __HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_3,5999 );

}
void stop_puzzer(void){
    __HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_3,0);

}
/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
/* USER CODE END 0 */

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
  MX_TIM1_Init();
  MX_TIM3_Init();
  MX_TIM4_Init();
  MX_TIM5_Init();
  MX_TIM6_Init();
  MX_TIM7_Init();
	MX_USART1_UART_Init();
  MX_USART6_UART_Init();
  /* USER CODE BEGIN 2 */
	
		HAL_TIM_PWM_Start(&htim1,TIM_CHANNEL_1);
		HAL_TIM_PWM_Start(&htim1,TIM_CHANNEL_2);	
		HAL_TIM_PWM_Start(&htim1,TIM_CHANNEL_3);	
		HAL_TIM_PWM_Start(&htim1,TIM_CHANNEL_4);
	
    // --------------------------------------------定时器蜂鸣器的pwm启动------------------------------------------
	HAL_TIM_PWM_Start(&htim4,TIM_CHANNEL_3);
    // --------------------------------------------定时器蜂鸣器的pwm启动------------------------------------------	
		
		SET_BIT(huart6.Instance->CR3, USART_CR3_DMAR); //使能DMA串口接收
		__HAL_UART_ENABLE_IT(&huart6, UART_IT_IDLE);  //使能空闲中断
		
		hdma_usart6_rx.Instance->PAR = (uint32_t)&(USART6->DR); //DMA传输外设地址
		hdma_usart6_rx.Instance->M0AR = (uint32_t)(referee_buf); //DMA传输存储器地址
		
		__HAL_DMA_SET_COUNTER(&hdma_usart6_rx, REFEREE_BUF_LEN); //DMA传输数据的个数(循环模式)
		__HAL_DMA_ENABLE(&hdma_usart6_rx); //串口DMA使能
  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
		//start_puzzer();
    /* USER CODE END WHILE */
	//  -------------------------完成与视觉通信数据的定时解析-----------------------------------------------------------------------------------------------------
		time1++;
		if(time1%10000==0)
			{
				
			 ParseRefereeSystemData();

		  }
		//  -------------------------完成与视觉通信数据的定时解析-----------------------------------------------------------------------------------------------------
			
			
			
    //------------------------------------------检测到垃圾发送给A板-------------------------------------------------------------------------------------------
		if(target_position.flag ==1){
			time2++;
			if(time2%1000000==0){
				if(ABS(last_x-target_position.x) <CONSTRAIN && ABS(last_y-target_position.y)<CONSTRAIN){
					for(uint8_t j=0;j<4;j++){
						center_y = y_start+j*delta_y;
						for(uint8_t i=0;i<3;i++){
							center_x = x_start+i*delta_x;
							if(square_sum((center_x-last_x),(center_y-last_y))<=pd)
                                {
//								to_A[0] =(uint8_t) (j*3+i);
//								to_A[1] =(uint8_t)(target_position.yaw);
                                to_A[0] = 0xAA;
                                to_A[1]=(uint8_t) (j*3+i);
                                to_A[2]= (uint8_t)(target_position.yaw);
                                to_A[3]=(uint8_t)target_position.rubbish_class;
                                //if(FLAG!=0){     //按下按键后，才可以发送给A板数据
                                HAL_UART_Transmit(&huart1, to_A, sizeof(to_A), 100);	
//								HAL_UART_Transmit(&huart1, to_b, sizeof(to_b)-1, 100); 
                                //}
                               
							}
								
						}					
					}
				}			
				last_x =target_position.x;
				last_y =target_position.y;	
			}
		}
	  //------------------------------------------检测到垃圾发送给A板-------------------------------------------------------------------------------------------
//------------------------------------------------距离运算-----------------------------------------------------------------------------------------------------
		ultrasound1.distance = ultrasound1.count/1000000.0f*340.0f/2.0f*100.0f;
		ultrasound2.distance = ultrasound2.count/1000000.0f*340.0f/2.0f*100.0f;
		ultrasound3.distance = ultrasound3.count/1000000.0f*340.0f/2.0f*100.0f;
		ultrasound4.distance = ultrasound4.count/1000000.0f*340.0f/2.0f*100.0f;
        
//-----------------------------------------------距离运算-----------------------------------------------------------------------------------------------------
//-----------------------------------------------检测是否满载--------------------------------------------------------------------------------------------------
   
//-----------------------------------------------检测是否满载-------------------------------------------------------------------------------------------------			

    /* USER CODE BEGIN 3 */
//	HAL_UART_Transmit(&huart1, &to_b, sizeof(to_b), 100);	
//    HAL_Delay(500);

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
  RCC_OscInitStruct.PLL.PLLN = 168;
  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV2;
  RCC_OscInitStruct.PLL.PLLQ = 4;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
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
