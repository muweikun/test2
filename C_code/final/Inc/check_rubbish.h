#ifndef CHECK_RUBBISH   // ����Ƿ�δ���� CHECK_RUBBISH
#define CHECK_RUBBISH   // ���δ���壬������

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
    enum full_infect dustbin;  // ��ö��������Ϊ�ṹ���Ա
} DustbinStatus;

extern MeasurementData ultrasound1;
extern MeasurementData ultrasound2;
extern MeasurementData ultrasound3;
extern MeasurementData ultrasound4;



void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) ;


#endif // ���� CHECK_RUBBISH �궨��
