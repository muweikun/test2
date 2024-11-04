#include "main.h"
#include "tim.h"
#include "gpio.h"
#include "check_rubbish.h"
// 定义按键防抖的时间阈值，单位为毫秒
#define DEBOUNCE_TIME 50
extern uint8_t FLAG ;

// 声明一个变量用于存储上一次按键中断的时间
static uint32_t last_interrupt_time = 0;

void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
    // 第一个超声波测量中断，GPIO引脚为8号引脚
    if (GPIO_Pin == rub_1_8_Pin) {
        if (HAL_GPIO_ReadPin(rub_1_8_GPIO_Port, rub_1_8_Pin) == GPIO_PIN_SET && !ultrasound1.flag) {
            HAL_TIM_Base_Start(&htim5);
            ultrasound1.flag = 1;
        } else if (HAL_GPIO_ReadPin(rub_1_8_GPIO_Port, rub_1_8_Pin) == GPIO_PIN_RESET && ultrasound1.flag) {
            ultrasound1.count = __HAL_TIM_GET_COUNTER(&htim5);
            __HAL_TIM_SET_COUNTER(&htim5, 0);
            HAL_TIM_Base_Stop(&htim5);
            ultrasound1.flag = 0;
        }
    }

    // 第二个超声波测量中断，GPIO引脚为1号引脚
    if (GPIO_Pin == rub_2_7_Pin) {
        if (HAL_GPIO_ReadPin(rub_2_7_GPIO_Port, rub_2_7_Pin) == GPIO_PIN_SET && !ultrasound2.flag) {
            HAL_TIM_Base_Start(&htim6);
            ultrasound2.flag = 1;
        } else if (HAL_GPIO_ReadPin(rub_2_7_GPIO_Port, rub_2_7_Pin) == GPIO_PIN_RESET && ultrasound2.flag) {
            ultrasound2.count = __HAL_TIM_GET_COUNTER(&htim6);
            __HAL_TIM_SET_COUNTER(&htim6, 0);
            HAL_TIM_Base_Stop(&htim6);
            ultrasound2.flag = 0;
        }
    }

    // 第三个超声波测量中断，GPIO引脚为5号引脚
    if (GPIO_Pin == rub_3_5_Pin) {
        if (HAL_GPIO_ReadPin(rub_3_5_GPIO_Port, rub_3_5_Pin) == GPIO_PIN_SET && !ultrasound3.flag) {
            HAL_TIM_Base_Start(&htim7);
            ultrasound3.flag = 1;
        } else if (HAL_GPIO_ReadPin(rub_3_5_GPIO_Port, rub_3_5_Pin) == GPIO_PIN_RESET && ultrasound3.flag) {
            ultrasound3.count = __HAL_TIM_GET_COUNTER(&htim7);
            __HAL_TIM_SET_COUNTER(&htim7, 0);
            HAL_TIM_Base_Stop(&htim7);
            ultrasound3.flag = 0;
        }
    }

    // 第四个超声波测量中断，GPIO引脚为6号引脚
    if (GPIO_Pin == rub_4_6_Pin) {
        if (HAL_GPIO_ReadPin(rub_4_6_GPIO_Port, rub_4_6_Pin) == GPIO_PIN_SET && !ultrasound4.flag) {
            HAL_TIM_Base_Start(&htim3);
            ultrasound4.flag = 1;
        } else if (HAL_GPIO_ReadPin(rub_4_6_GPIO_Port, rub_4_6_Pin) == GPIO_PIN_RESET && ultrasound4.flag) {
            ultrasound4.count = __HAL_TIM_GET_COUNTER(&htim3);
            __HAL_TIM_SET_COUNTER(&htim3, 0);
            HAL_TIM_Base_Stop(&htim3);
            ultrasound4.flag = 0;
        }
    }
    // ----------------------------------按键中断回调--------------------进入这个模块后置位启动运行标准位-------
    if (GPIO_Pin == key_Pin)
    {
        // 获取当前的时间戳
        uint32_t current_time = HAL_GetTick();
        
        // 检查当前时间与上一次中断时间的差是否大于防抖阈值
        if ((current_time - last_interrupt_time) > DEBOUNCE_TIME)
        {

            last_interrupt_time = current_time;
            FLAG =1;
            
            

        }
    }

       
}
