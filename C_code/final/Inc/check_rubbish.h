#ifndef CHECK_RUBBISH   // 检查是否未定义 CHECK_RUBBISH
#define CHECK_RUBBISH   // 如果未定义，则定义它

#include "main.h"


enum full_infect{
	One_dustbin,
	Two_dustbin,
	Three_dustbin,
	Four_dustbin
};
typedef struct{
	volatile uint8_t flag;
	volatile uint32_t count;
	volatile float distance;
}MeasurementData;

typedef struct {
    uint8_t Flag;
    enum full_infect dustbin;  // 将枚举类型作为结构体成员
} DustbinStatus;

extern MeasurementData ultrasound1;
extern MeasurementData ultrasound2;
extern MeasurementData ultrasound3;
extern MeasurementData ultrasound4;



void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) ;


#endif // 结束 CHECK_RUBBISH 宏定义
