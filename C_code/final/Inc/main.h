/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.h
  * @brief          : Header for main.c file.
  *                   This file contains the common defines of the application.
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

/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __MAIN_H
#define __MAIN_H

#ifdef __cplusplus
extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/
#include "stm32f4xx_hal.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* Exported types ------------------------------------------------------------*/
/* USER CODE BEGIN ET */

/* USER CODE END ET */

/* Exported constants --------------------------------------------------------*/
/* USER CODE BEGIN EC */

/* USER CODE END EC */

/* Exported macro ------------------------------------------------------------*/
/* USER CODE BEGIN EM */

/* USER CODE END EM */

/* Exported functions prototypes ---------------------------------------------*/
void Error_Handler(void);

/* USER CODE BEGIN EFP */

/* USER CODE END EFP */

/* Private defines -----------------------------------------------------------*/
#define rub_4_6_Pin GPIO_PIN_1
#define rub_4_6_GPIO_Port GPIOF
#define rub_4_6_EXTI_IRQn EXTI1_IRQn
#define key_Pin GPIO_PIN_0
#define key_GPIO_Port GPIOA
#define key_EXTI_IRQn EXTI0_IRQn
#define rub_1_8_Pin GPIO_PIN_12
#define rub_1_8_GPIO_Port GPIOB
#define rub_1_8_EXTI_IRQn EXTI15_10_IRQn
#define rub_3_5_Pin GPIO_PIN_14
#define rub_3_5_GPIO_Port GPIOB
#define rub_3_5_EXTI_IRQn EXTI15_10_IRQn
#define rub_2_7_Pin GPIO_PIN_15
#define rub_2_7_GPIO_Port GPIOB
#define rub_2_7_EXTI_IRQn EXTI15_10_IRQn
/* USER CODE BEGIN Private defines */

/* USER CODE END Private defines */

#ifdef __cplusplus
}
#endif

#endif /* __MAIN_H */
