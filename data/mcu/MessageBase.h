
/** @file
 *	@brief Message header file
 *  @author Xianhao Ji
 */
#pragma once

#define ON_CBOARD

#include <stdint.h>

#ifdef ON_CBOARD
#include "Libraries/Scheduler/Scheduler_Common.h"
#include "Libraries/UART/UARTDriver.h"
#define TIME_T timeus_t
#define OFFBOARDLINK_TARGET_ADDRESS 0xEE
#define OFFBOARDLINK_SOURCE_ADDRESS 0xFF
#define OFFBOARDLINK_MESSAGE_TIMEOUT 500000
#endif
#ifdef ON_MINIPC
#include <ros/ros.h>
#define TIME_T double
#define OFFBOARDLINK_TARGET_ADDRESS 0xFF
#define OFFBOARDLINK_SOURCE_ADDRESS 0xEE
#define OFFBOARDLINK_MESSAGE_TIMEOUT 0.5
#endif

#define OFFBOARDLINK_FRAME_HEAD 0xAA
#define OFFBOARDLINK_FRAME_HEAD_LEN 4
#define OFFBOARDLINK_FRAME_VERIFY_LEN 2
#define OFFBOARDLINK_FRAME_MAX_LEN 60

#define OFFBOARDLINK_MSG_MAX_NUM 0xFF
#define OFFBOARDLINK_PUB_LEN 60

namespace olk
{
union helper_float_u32
{
    float f;
    uint8_t u[4];
};

enum MessagePriority
{
    MessagePriority_NORMAL = 0,
    MessagePriority_IMPORTANT = 1,
    MessagePriority_EMERGENCY = 2
};

class Subscriber;

struct MessageBase
{
    friend class Subscriber;
    friend class Publisher;
    friend class PublishBuffer;
    protected:
    TIME_T timestamp;
    float hz;
    uint64_t count;
    uint64_t error;
    uint64_t count_total;
    TIME_T timetamp_start_count;
    
    uint8_t func_id;
    uint8_t data_len;
    uint8_t seq;
    
    uint8_t send_buf[OFFBOARDLINK_FRAME_MAX_LEN];
    
    MessageBase *same_len_msg_next;
    
    virtual void decode(uint8_t *buf) = 0;
    
    void calcVerify(uint8_t *buf, uint8_t &sum_verify, uint8_t &sum_sum_verify)
    {
        sum_verify = 0;
        sum_sum_verify = 0;
        for(uint8_t i = 0; i < data_len + OFFBOARDLINK_FRAME_HEAD_LEN; i ++)
        {
            sum_verify += buf[i];
            sum_sum_verify += sum_verify;
        }
    }
    
    bool verify(uint8_t *buf)
    {
        uint8_t sum_verify, sum_sum_verify;
        calcVerify(buf, sum_verify, sum_sum_verify);
        if(sum_verify == buf[data_len + OFFBOARDLINK_FRAME_HEAD_LEN] && sum_sum_verify == buf[data_len + OFFBOARDLINK_FRAME_HEAD_LEN + 1])
        {
            
            return true;
        }
        else return false;
    }
    
    public:
    MessageBase(uint8_t func_id, uint8_t data_len)
    {
        this->func_id = func_id;
        this->data_len = data_len;
    }		
    
    TIME_T getTimestamp(void)
    {
        return timestamp;
    }
    
    bool isTimeout(void)
    {
        #ifdef ON_CBOARD
        return robo_lib::micros() - timestamp >= OFFBOARDLINK_MESSAGE_TIMEOUT;
        #endif
        #ifdef ON_MINIPC
        return ros::Time::now().toSec() - timestamp >= OFFBOARDLINK_MESSAGE_TIMEOUT;
        #endif
    }
    
    uint64_t getCountTotal() 
    {
        return count_total - error;
    }

    virtual void packData(uint8_t * buf) = 0;
    
    uint8_t * pack(void)
    {
        uint8_t sum_verify, sum_sum_verify;
        
        send_buf[0] = OFFBOARDLINK_FRAME_HEAD;
        send_buf[1] = OFFBOARDLINK_SOURCE_ADDRESS;
        send_buf[2] = func_id;
        send_buf[3] = data_len;
        packData(send_buf);
        
        calcVerify(send_buf, sum_verify, sum_sum_verify);
        send_buf[data_len + OFFBOARDLINK_FRAME_HEAD_LEN] = sum_verify;
        send_buf[data_len + OFFBOARDLINK_FRAME_HEAD_LEN + 1] = sum_sum_verify;
        
        return send_buf;
    }
    
    bool unpack(uint8_t * buf)
    {
        count_total += 1;
        if(verify(buf))
        {
            decode(buf);
            
            #ifdef ON_CBOARD
            timestamp = robo_lib::micros();
            
            if(timetamp_start_count == 0 || timetamp_start_count + 1e6 <= timestamp)
            {
                timetamp_start_count = timestamp;
                hz = count;
                count = 0;
            }
            else count += 1;
            #endif
            #ifdef ON_MINIPC
            timestamp = ros::Time::now().toSec();
            #endif
            
            return true;
        }
        else
        {
            error += 1;
            return false;
        }				;
    }
};

struct MessageBaseStamped
{
    MessageBase *msg_p;
    timeus_t stamp;
};
};
