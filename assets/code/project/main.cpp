`
/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2022 STMicroelectronics.
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
#include "adc.h"
#include "can.h"
#include "dma.h"
#include "i2c.h"
#include "iwdg.h"
#include "spi.h"
#include "tim.h"
#include "usart.h"
#include "gpio.h"
/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */
#include "Vehicle/${vehicle_obj_list[i].vehicle_name}/Robot/Robot.h"
#include "Libraries/UART/UARTDriver.h"
#include "Libraries/Math/Vector3.h"
#include "stm32f4xx_it.h"
/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */
using namespace robo_lib;
/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */
#include "Libraries/Scheduler/Scheduler_Common.h"
/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
Robot robot;
//volatile PIDGyrotempTask a(robot ,0);
/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
  /* USER CODE BEGIN 1 */
//  Vector3f x, y;
//  x = y*1;
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
  MX_ADC1_Init();
  MX_ADC3_Init();
  MX_CAN1_Init();
  MX_CAN2_Init();
  MX_DMA_Init();
  MX_I2C2_Init();
  MX_I2C3_Init();
  MX_SPI1_Init();
  MX_SPI2_Init();
  MX_TIM1_Init();
  MX_TIM10_Init();
  MX_TIM2_Init();
  MX_TIM4_Init();
  MX_TIM5_Init();
  MX_TIM8_Init();
  MX_USART1_UART_Init();
  MX_USART3_UART_Init();
  MX_USART6_UART_Init();
  
  HAL_GPIO_WritePin(LASER_GPIO_Port, LASER_Pin,GPIO_PIN_SET);
//  MX_IWDG_Init();
  /* USER CODE BEGIN 2 */
  robot.init();

  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* USER CODE END WHILE */
    robot.run();

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
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_LSI|RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.LSIState = RCC_LSI_ON;
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
/*定时器4中断回调函数*/
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
  static uint8_t tim2clk;
  if(htim == &htim2) // 200 Hz
  {
    if(++tim2clk > 199)
    {
      tim2clk = 0;
    }
		
		/**
	 @brief 5 Hz陀螺仪控温,舵机控制，超级电容TX包更新
		*/
    if(tim2clk % 40 == 0) 
    {
      
    }
		
		/**
	 @brief 70 Hz遥控器更新
		*/
    if(tim2clk % 3 == 0) 
    {

    }
		
		/**
	 @brief 100HZ 调试窗口
		*/
		if(tim2clk % 2 ==0)//100HZ
		{

		}
		/**
	 @brief 200HZ LED
		*/		
		//robot.getLEDControlTaskPointer()->update(5000);
  }
}

#include "Libraries/RCProtocol/RCProtocol_DBUS.h"
extern UART_HandleTypeDef huart3;
extern DMA_HandleTypeDef hdma_usart3_rx;
//extern uint8_t sbus_rx_buf[2][SBUS_RX_BUF_NUM];

/*串口3中断处理函数(遥控器)*/
void USART3_IRQHandler(void)
{
//		RCProtocol *rc_protocol = robot.getRCProtocolPointer();
//		if(rc_protocol == NULL) return;
  if(huart3.Instance->SR & UART_FLAG_RXNE) //接收到数据
  {
    __HAL_UART_CLEAR_PEFLAG(&huart3);
  }
  else if(USART3->SR & UART_FLAG_IDLE)
  {
    static uint16_t this_time_rx_len = 0;

    __HAL_UART_CLEAR_PEFLAG(&huart3);

    if ((hdma_usart3_rx.Instance->CR & DMA_SxCR_CT) == RESET)
    {
      /* Current memory buffer used is Memory 0 */

      //disable DMA
      //失效DMA
      __HAL_DMA_DISABLE(&hdma_usart3_rx);

      //get receive data length, length = set_data_length - remain_length
      this_time_rx_len = SBUS_RX_BUF_NUM - hdma_usart3_rx.Instance->NDTR;

      //reset set_data_lenght
      hdma_usart3_rx.Instance->NDTR = SBUS_RX_BUF_NUM;

      //set memory buffer 1
      hdma_usart3_rx.Instance->CR |= DMA_SxCR_CT;

      //enable DMA
      __HAL_DMA_ENABLE(&hdma_usart3_rx);
			
      if(this_time_rx_len == RC_FRAME_LENGTH)
      {
        RCProtocol *rc_protocol = robot.getRCProtocolPointer();
        if(rc_protocol != NULL)
        {
          rc_protocol->processByte(rc_protocol->sbus_rx_buf[0]);
        }
      }
    }
    else
    {
      /* Current memory buffer used is Memory 1 */
      //disable DMA
      //失效DMA
      __HAL_DMA_DISABLE(&hdma_usart3_rx);

      //get receive data length, length = set_data_length - remain_length
      this_time_rx_len = SBUS_RX_BUF_NUM - hdma_usart3_rx.Instance->NDTR;

      //reset set_data_lenght
      hdma_usart3_rx.Instance->NDTR = SBUS_RX_BUF_NUM;

      //set memory buffer 0
      DMA1_Stream1->CR &= ~(DMA_SxCR_CT);

      //enable DMA
      __HAL_DMA_ENABLE(&hdma_usart3_rx);

			//USART1_DMA_Debug_Printf("%d", this_time_rx_len);
      if(this_time_rx_len == RC_FRAME_LENGTH)
      {
        RCProtocol *rc_protocol = robot.getRCProtocolPointer();
        if(rc_protocol != NULL)
        {
          rc_protocol->processByte(rc_protocol->sbus_rx_buf[1]);
        }
      }
    }
  }
}

// #include "Vehicle/Sentry_Gimbal/Control/ComputerVisionControlTask.h"
extern UART_HandleTypeDef huart1;
extern DMA_HandleTypeDef hdma_usart1_rx;
extern UART_HandleTypeDef huart6;
extern DMA_HandleTypeDef hdma_usart6_rx;
/*串口1中断处理函数(CV)*/
void USART1_IRQHandler(void)
{
  volatile static uint16_t start_pos = 0;
  volatile static uint16_t end_pos = 0;

	HAL_UART_IRQHandler(&huart1);
	
  if(huart1.Instance->SR & UART_FLAG_IDLE)
  {
    __HAL_UART_CLEAR_IDLEFLAG(&huart1);

//    start_pos = end_pos;
//    end_pos = CV_FIFO_BUF_LEN_1 - __HAL_DMA_GET_COUNTER(&hdma_usart1_rx);
//    ComputerVisionControlTask *task_p = robot.getCV_ControlTaskPointer();
//    if(task_p != NULL)
//    {
//      task_p->pushToBuffer_1(start_pos, end_pos);
//    }

  }
}

/*串口6中断处理函数(CV)*/
void USART6_IRQHandler(void)
{
  volatile static uint16_t start_pos = 0;
  volatile static uint16_t end_pos = 0;

	HAL_UART_IRQHandler(&huart6);
	
  if(huart6.Instance->SR & UART_FLAG_IDLE)
  {
    __HAL_UART_CLEAR_IDLEFLAG(&huart6);

//    start_pos = end_pos;
//    end_pos = CV_FIFO_BUF_LEN_6 - __HAL_DMA_GET_COUNTER(&hdma_usart6_rx);
//    ComputerVisionControlTask *task_p = robot.getCV_ControlTaskPointer();
//    if(task_p != NULL)
//    {
//      task_p->pushToBuffer_6(start_pos, end_pos);
//    }

  }
}

/*GPIO_EXIT_姿态解算任务调用位置*/
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{

//  AttitudeSolutionTask * attitude_solution_task_p = robot.getAttitudeSolutionTaskPointer();

//  if(GPIO_Pin == BMI088_ACCEL_INT1_Pin && attitude_solution_task_p != NULL)
//  {
//    static timeus_t time_now,time_last;
//    time_last = time_now;
//    time_now = robot.getScheduler().getSysTimeUs();
//    attitude_solution_task_p->update(time_now - time_last);
//    // robot.getHelperPointer()->toggleLED(1, 0 ,0);
//  }
}

#include "Libraries/CanDevice/CanDevice.h"

extern CAN_HandleTypeDef hcan1;
extern CAN_HandleTypeDef hcan2;

/*CAN接收中断回调函数*/
void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan)
{
  CAN_RxHeaderTypeDef rx_header;
  uint8_t rx_data[8];

  CanDevice *can1_device_p = robot.getCAN1DevicePointer();
  CanDevice *can2_device_p = robot.getCAN2DevicePointer();

  HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &rx_header, rx_data);
  if(hcan == &hcan1)
  {
    for(int i = 0; i<can1_device_p->can_rx_link_count; i++)
    {
      if(can1_device_p->can_rx_data_p[i]->header.StdId == rx_header.StdId)
      {
        for(int j = 0; j<8; j++)
          can1_device_p->can_rx_data_p[i]->data[j] = rx_data[j];
				can1_device_p->can_rx_data_p[i]->rec_cnt ++;
				if(can1_device_p->can_rx_data_p[i]->timestamp - can1_device_p->can_rx_data_p[i]->timestamp_start_count > 1000000)
				{
					can1_device_p->can_rx_data_p[i]->timestamp_start_count = can1_device_p->can_rx_data_p[i]->timestamp;
					can1_device_p->can_rx_data_p[i]->hz = (can1_device_p->can_rx_data_p[i]->rec_cnt - can1_device_p->can_rx_data_p[i]->rec_cnt_start_count);
					can1_device_p->can_rx_data_p[i]->rec_cnt_start_count = can1_device_p->can_rx_data_p[i]->rec_cnt;
				}
				can1_device_p->can_rx_data_p[i]->timestamp = micros();
      }
    }
  }
  if(hcan == &hcan2)
  {
    for(int i = 0; i<can2_device_p->can_rx_link_count; i++)
    {
      if(can2_device_p->can_rx_data_p[i]->header.StdId == rx_header.StdId)
      {
        for(int j = 0; j<8; j++)
          can2_device_p->can_rx_data_p[i]->data[j] = rx_data[j];
				can2_device_p->can_rx_data_p[i]->rec_cnt ++;
				if(can2_device_p->can_rx_data_p[i]->timestamp - can2_device_p->can_rx_data_p[i]->timestamp_start_count > 1000000)
				{
					can2_device_p->can_rx_data_p[i]->timestamp_start_count = can2_device_p->can_rx_data_p[i]->timestamp;
					can2_device_p->can_rx_data_p[i]->hz = (can2_device_p->can_rx_data_p[i]->rec_cnt - can2_device_p->can_rx_data_p[i]->rec_cnt_start_count);
					can2_device_p->can_rx_data_p[i]->rec_cnt_start_count = can2_device_p->can_rx_data_p[i]->rec_cnt;
				}
				can2_device_p->can_rx_data_p[i]->timestamp = micros();
      }
    }
  }
}

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
     ex: printf("Wrong parameters value: file %s on line %d
", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
`