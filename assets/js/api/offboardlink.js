
let fs = require('fs');
let path = require('path');
let {serial_buffer2hex_string, mylog} = require(process.cwd() + '/assets/js/api/helper');

let Offboardlink = {};


Offboardlink.TypeSizeMap = {
    "int8" : 1,
    "uint8": 1,
    "int16": 2,
    "uint16": 2,
    "int32": 4,
    "uint32": 4,
    "float32": 4,
    "float64": 8
};

Offboardlink.TypeCppMap = {
    "int8" : "int8_t",
    "uint8": "uint8_t",
    "int16": "int16_t",
    "uint16": "uint16_t",
    "int32": "int32_t",
    "uint32": "uint32_t",
    "float32": "float",
    "float64": "double"
};

Offboardlink.checkDataValid = function(data) {
    if(!data.hasOwnProperty('data') || !data.hasOwnProperty('type')) {
        return false;
    }

    if(data.hasOwnProperty('scale')) {
        let type = data['type'];
        if(type.split('_scale_to_').length != 2) {
            return false;
        }
    }

    return true;
};

Offboardlink.checkMsgValid = function(msg) {
    if(!msg.hasOwnProperty('func_id') || !msg.hasOwnProperty('data_list')) {
        return false;
    }

    if(!msg['data_list'].hasOwnProperty('length')) {
        return false;
    }

    if(msg['data_list'].length == 0) {
        return false;
    }

    for(let i = 0; i < msg['data_list'].length; i ++) {
        if(!this.checkDataValid(msg['data_list'][i])) {
            return false;
        }
    }

    return true;
};

Offboardlink.Message = function(str_id, msg) {
    let that = {};

    let _data_list = msg['data_list'];
    let _func_id = parseInt(msg['func_id']);
    let _str_id = str_id;

    let _func_id_16 = _func_id.toString(16);
    _func_id_16 = '0'.concat(_func_id_16).slice(-2);

    let _ros_msg_generate = true;

    if(msg.hasOwnProperty('ros_msg_generate')) {
        _ros_msg_generate = msg['ros_msg_generate'];
    }

    that.getRosMsgGenerateEnable = function() {
        return _ros_msg_generate;
    }

    that.getDataLen = function() {
        let data_len = 0;

        for(let i = 0; i < _data_list.length; i ++) {
            let data = _data_list[i];
            if(data.hasOwnProperty('scale')) {
                let type_target = data.type.split('_scale_to_')[1];
                let repeat = 1;
                if(type_target.split('[').length == 2) {
                    if(type_target.split('[')[1].split(']').length == 2) {
                        repeat = parseInt(type_target.split('[')[1].split(']')[0]);
                        // mylog('repeat: ' + type_target.split('[')[1].split(']')[1] + ' ' + repeat);
                        if(isNaN(repeat)) {
                            repeat = 1;
                        }
                    }
                    if(Offboardlink.TypeSizeMap.hasOwnProperty(type_target.split('[')[0])) {
                        data_len += Offboardlink.TypeSizeMap[type_target.split('[')[0]] * repeat;
                    }
                }
                else {
                    data_len += Offboardlink.TypeSizeMap[type_target];
                }
            }
            else {
                let type_target = data.type;
                let repeat = 1;
                if(type_target.split('[').length == 2) {
                    if(type_target.split('[')[1].split(']').length == 2) {
                        repeat = parseInt(type_target.split('[')[1].split(']')[0]);
                        // mylog('repeat' + ' ' + repeat + ' ' + type_target.split('[')[1].split(']'));
                        if(isNaN(repeat)) {
                            repeat = 1;
                        }
                    }
                    if(Offboardlink.TypeSizeMap.hasOwnProperty(type_target.split('[')[0])) {
                        data_len += Offboardlink.TypeSizeMap[type_target.split('[')[0]] * repeat;
                    }
                }
                else {
                    data_len += Offboardlink.TypeSizeMap[type_target];
                }
            }
        }

        return data_len;
    };

    that.getStrId = function() {
        return _str_id;
    };

    that.getDataList = function() {
        return _data_list;
    };

    that.getFuncId = function() {
        return _func_id;
    };

    that.getOutputDataViz = function() {
        let output_data_viz = 'data[' + that.getDataLen() +']';
        // for(let i = 0; i < _data_list.length; i ++) {
        //     let type = _data_list[i].type;
        //     let data = _data_list[i].data;
        //     if(type == 'int8' || type == 'uint8') {
        //         output_data_viz += ' ' + data;
        //     }
        //     else if(type == 'int16' || type == 'uint16') {
        //         output_data_viz += ' ' + data + '>>8 ' + data + '&0xFF';
        //     }
        //     else {
        //         output_data_viz += ' ' + data;
        //     }
        // }
        return output_data_viz;
    };

    let getDecodeCode = function(var_type, var_name, buf_data, scale) {
        let decode_data = `
`;
        if(var_type == 'float32') {
            decode_data += 
`			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = ${scale ? '(' : ''}buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos} + i]${scale ? (')' + ' / ' + scale) : ''};
            }
            ${var_name} = h.f;
`;
            buf_data.pos += 4;
        }
        if(var_type == 'uint8' || var_type == 'int8') {
            decode_data += 
        `			${var_name} = ${scale ? '(' : ''}buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos}]${scale ? (')' + ' / ' + scale) : ''};
        `;
            buf_data.pos += 1;
        }

        if(var_type == 'uint16' || var_type == 'int16') {
            decode_data += 
`			${var_name} = ${scale ? '(' + Offboardlink.TypeCppMap[var_type] + ')(' : ''}(buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos + 1}] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos}]${scale ? (')' + ' / ' + scale) : ''};
`;
            buf_data.pos += 2;
        }

        if(var_type == 'uint32' || var_type == 'int32') {
            decode_data += 
`			${var_name} = ${scale ? '(' + Offboardlink.TypeCppMap[var_type] + ')(' : ''}((buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos + 3}] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos + 2}]) << 16 | ((buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos + 1}] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos}])${scale ? (')' + ' / ' + scale) : ''};
`;
            buf_data.pos += 4;
        }

        return decode_data;
    };

    let genPackCode = function(var_type, var_name, buf_data) {
        let pack_data = `
`;
        if(var_type == 'float32') {
            pack_data += 
`			h.f = ${var_name};
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos} + i] = h.u[i];
            }
`;
            buf_data.pos += 4;
        }

        if(var_type == 'uint8' || var_type == 'int8') {
            pack_data += 
`			buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos}] = ${var_name};
`;
            buf_data.pos += 1;
        }

        if(var_type == 'uint16' || var_type == 'int16') {
            pack_data += 
`			buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos}] = ${var_name};
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos + 1}] = (${Offboardlink.TypeCppMap[var_type]})(${var_name}) >> 8;
`;
            buf_data.pos += 2;
        }

        if(var_type == 'uint32' || var_type == 'int32') {
            pack_data += 
`			buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos}] = ${var_name};
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos + 1}] = (${Offboardlink.TypeCppMap[var_type]})(${var_name}) >> 8;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos + 2}] = (${Offboardlink.TypeCppMap[var_type]})(${var_name}) >> 16;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + ${buf_data.pos + 3}] = (${Offboardlink.TypeCppMap[var_type]})(${var_name}) >> 24;
`;
            buf_data.pos += 4;
        }

        return pack_data;
    };

    that.getExportMCUCppCode = function() {
        let variable_list = '';    
        let pack_data = '', decode_data = '';
        let buf_data = {
            pos: 0
        };
        let buf_decode_data = {
            pos: 0
        };
        let float32_has = false;
        for(let i = 0; i < _data_list.length; i ++) {
            let var_type = _data_list[i].type;
            let var_name = _data_list[i].data;

            if(var_type.split('_scale_to_').length == 2) {
                var_type = _data_list[i].type.split('_scale_to_')[0];
                let target_var_type = _data_list[i].type.split('_scale_to_')[1];
                if(target_var_type.split('[').length == 2) {
                    let arr_len = parseInt(_data_list[i].type.split('[')[1].split(']')[0]);
                    // mylog("arr_len " + arr_len + ' ' + target_var_type);
                    for(let j = 0; j < arr_len; j ++) {
                        pack_data += genPackCode(target_var_type.split('[')[0], '(' + var_name + `[${j}]` + ' * ' + _data_list[i].scale + ')', buf_data);
                        decode_data += getDecodeCode(target_var_type.split('[')[0], var_name, buf_decode_data, _data_list[i].scale);
                    }
                }
                else {
                    pack_data += genPackCode(_data_list[i].type.split('_scale_to_')[1], '(' + var_name + ' * ' + _data_list[i].scale + ')', buf_data);
                    decode_data += getDecodeCode(_data_list[i].type.split('_scale_to_')[1], var_name, buf_decode_data, _data_list[i].scale);
                }
            }
            else {
                if(var_type.split('[').length == 2) {
                    let temp_var_type = var_type.split('[')[0];
                    let arr_len = parseInt(_data_list[i].type.split('[')[1].split(']')[0]);
                    // mylog("arr_len " + arr_len);
                    for(let j = 0; j < arr_len; j ++) {
                        pack_data += genPackCode(temp_var_type, var_name + `[${j}]`, buf_data);
                        decode_data += getDecodeCode(temp_var_type, var_name + `[${j}]`, buf_decode_data);
                    }
                }
                else {
                    pack_data += genPackCode(var_type, var_name, buf_data);
                    decode_data += getDecodeCode(var_type, var_name, buf_decode_data);
                }
            }

            if(var_type.split('[').length == 2) {
                var_type = var_type.split('[')[0];
            }

            if(var_type == 'float32') {
                float32_has = true;
            }

            var_type = Offboardlink.TypeCppMap[var_type];

            if(_data_list[i].type.split('[').length == 2) {
                let arr_len = parseInt(_data_list[i].type.split('[')[1].split(']')[0]);
                var_name += `[${arr_len}]`;
            }

            variable_list += 
`${var_type} ${var_name};
        `;
        
        }
        if(float32_has) {
            variable_list +=
`helper_float_u32 h;
            `;
            ;
        }

        let code = 
`
/** @file
 *	@brief Offboardlink comm protocol generated from ${_str_id}.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct ${_str_id} : public MessageBase
    {
        public:
        ${variable_list}
        ${_str_id}() : MessageBase(0x${_func_id_16}, ${that.getDataLen()})
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {
${decode_data}
        }

        virtual void packData(uint8_t *buf) override
        {
${pack_data}
        }
    };
}
        `;
        // mylog(code);
        return code;
    };

    return that;
};

Offboardlink.getOffboardlinkCode = function(settings) {
    let code = 
`

/** @file
 *	@brief Offboardlink header file
 *  @author Xianhao Ji
 */
#pragma once

#include "MessageBase.h"

#include "queue_for_mcu/queue.h"

namespace olk
{
    #ifdef ON_MINIPC
    enum port_selection
    {
    
    };
        #endif
    #ifdef ON_CBOARD
    enum port_selection
    {
        cboard_uart1 = 1, // UART2 on cboard overlay
        cboard_uart6 = 2 // UART1 on cboard overlay
    };
    #endif
	class PublishBuffer
	{
		public:
			PublishBuffer()
			{
				Queue_Init(&queue, msg_buffer, OFFBOARDLINK_PUB_LEN);
			}
			bool push(MessageBaseStamped msg)
			{
				QUEUE_StatusTypeDef status = Queue_Push(&queue, msg);
				if(status == QUEUE_OK) return true;
				else return false;
			}
			bool pop(MessageBaseStamped *msg_p)
			{
				QUEUE_StatusTypeDef status = Queue_Pop(&queue, msg_p);
				if(status == QUEUE_OK) return true;
				else return false;
			}
			bool peak(MessageBaseStamped *msg_p)
			{
				QUEUE_StatusTypeDef status = Queue_Peek(&queue, msg_p);
				if(status == QUEUE_OK) return true;
				else return false;
			}
			
			bool sendData(uint8_t *data, uint8_t size)
			{
				#ifdef ON_CBOARD
				if(HAL_UART_Transmit_DMA(&huart1, data, size) == HAL_BUSY) return false;
				else return true;
				#endif
				#ifdef ON_MINIPC
				return false;
				#endif
			}
			
            bool sendData(uint8_t *data, uint8_t size, port_selection port)
			{
				#ifdef ON_CBOARD
                    if(port == cboard_uart1){
                    if(HAL_UART_Transmit_DMA(&huart1, data, size) == HAL_BUSY) return false;
											else 
                    return true;
                    }
                    if(port == cboard_uart6){
                    if(HAL_UART_Transmit_DMA(&huart6, data, size) == HAL_BUSY) return false;
											else 
                    return true;
                    }
                        
                #endif
                #ifdef ON_MINIPC
                    return false;
                #endif
                // bu default
                return false;
			}

			void update(timeus_t dT_us)
			{
				timeus_t now = robo_lib::micros();
				MessageBaseStamped head;
				bool ok = peak(&head);
				if(ok)
				{
					if(now > head.stamp)
					{
						data_buf = head.msg_p->pack();
						bool hal_ok = sendData(data_buf, head.msg_p->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN);
						if(hal_ok)
						{
							pop(&head);
						}
					}
				}
			}

            void update(timeus_t dT_us, port_selection port)
			{
				timeus_t now = robo_lib::micros();
				MessageBaseStamped head;
				bool ok = peak(&head);
				if(ok)
				{
					if(now > head.stamp)
					{
						data_buf = head.msg_p->pack();
						bool hal_ok = sendData(data_buf, head.msg_p->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN, port);
						if(hal_ok)
//						{
							pop(&head);
//						}
					}
				}
			}
		protected:
			MessageBaseStamped msg_buffer[OFFBOARDLINK_PUB_LEN];
			QUEUE_HandleTypeDef queue;
			uint8_t *data_buf;
	};

	class Publisher
	{
		public:
			Publisher(void)
			{
				
			}
			
			bool sendData(uint8_t *data, uint8_t size)
			{
				#ifdef ON_CBOARD
				if(HAL_UART_Transmit_DMA(&huart1, data, size) == HAL_BUSY) return false;
				else return true;
				#endif
				#ifdef ON_MINIPC
				return false;
				#endif
			}

            bool sendData(uint8_t *data, uint8_t size, port_selection port)
			{
				#ifdef ON_CBOARD
                    if(port == cboard_uart1){
                    if(HAL_UART_Transmit_DMA(&huart1, data, size) == HAL_BUSY) return false;
                    }
                    else if(port == cboard_uart6){
                    if(HAL_UART_Transmit_DMA(&huart6, data, size) == HAL_BUSY) return false;
                    }
                        else 
                    return true;
                #endif
                #ifdef ON_MINIPC
                    return false;
                #endif
                // bu default
                return false;
			}
			
			bool publish(MessageBase *msg)
			{
				data_buf = msg->pack();
				return sendData(data_buf, msg->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN);
			}

            bool publish(MessageBase *msg, port_selection port)
			{
				data_buf = msg->pack();
				return sendData(data_buf, msg->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN, port);
			}
            
			
			void registerBuffer(PublishBuffer *buffer_p)
			{
				this->buffer_p = buffer_p;
			}
			
			void publishAsync(MessageBase *msg)
			{
				if(buffer_p == nullptr) return;
				MessageBaseStamped msg_stamped;
				msg_stamped.stamp = robo_lib::micros();
				msg_stamped.msg_p = msg;
				buffer_p->push(msg_stamped);
			}
			
		protected:
			uint8_t *data_buf;
			PublishBuffer *buffer_p;
	};
	
	class Subscriber
	{
		public:
			Subscriber(void)
			{
				
			}
		
			void subscribe(uint8_t func_id, MessageBase *msg)
			{
				uint8_t has_same = 0;
				
				for(uint8_t i = 0; i < OFFBOARDLINK_MSG_MAX_NUM; i ++)
				{
					if(sub_list[i] != nullptr && sub_list[i]->data_len == msg->data_len)
					{
						has_same = 1;
						if(sub_list[i]->same_len_msg_next == nullptr)
						{
							sub_list[i]->same_len_msg_next = msg;
							break;
						}
					}
				}
				
				sub_list[func_id] = msg;
				
				if(has_same == 0) frame_len_to_func_id_map[msg->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN] = msg;
				
				getMinMaxFrameLen(msg);
			}
			
			void getMinMaxFrameLen(MessageBase *msg)
			{
				if(msg->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN < min_frame_len)
				{
					min_frame_len = msg->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN;
				}
				if(msg->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN > max_frame_len)
				{
					max_frame_len = msg->data_len + OFFBOARDLINK_FRAME_HEAD_LEN + OFFBOARDLINK_FRAME_VERIFY_LEN;
				}
			}
			
			void processByte(uint8_t data)
			{
				rec_buffer[index] = data;
				index = index + 1;
				if(index >= 2 && rec_buffer[index - 2] == OFFBOARDLINK_FRAME_HEAD && data == OFFBOARDLINK_TARGET_ADDRESS)
				{
						index = 2;
						rec_buffer[0] = OFFBOARDLINK_FRAME_HEAD;
						rec_buffer[1] = OFFBOARDLINK_TARGET_ADDRESS;
				}
				
				if(index >= min_frame_len && index <= max_frame_len)
				{
					if(frame_len_to_func_id_map[index] != nullptr && rec_buffer[2] < OFFBOARDLINK_MSG_MAX_NUM)
					{
						MessageBase* msg = sub_list[rec_buffer[2]];
						if(msg != nullptr)
						{
							if(msg->unpack(rec_buffer))
							{
								index = 0;
							}
						}
					}
				}
				
				if(index > max_frame_len)
				{
					//index = 0;
				}
			}
		protected:
			MessageBase *sub_list[OFFBOARDLINK_MSG_MAX_NUM];
			MessageBase *frame_len_to_func_id_map[OFFBOARDLINK_FRAME_MAX_LEN];
			
			uint8_t rec_buffer[OFFBOARDLINK_FRAME_MAX_LEN];
			uint8_t index;
			uint8_t min_frame_len = 0xFF, max_frame_len = 0;
	};
	
	
	
};
`;
    return code;
}

Offboardlink.getMessageBaseCode = function(settings) {
    // mylog(settings.version);
    let code = 
`
/** @file
 *	@brief Message header file
 *  @author Xianhao Ji
 */
#pragma once

${
    settings.platform == 'mcu' ?'#define ON_CBOARD' : '#define ON_MINIPC'
}

#include <stdint.h>

#ifdef ON_CBOARD
${
    settings.version == 'v2.0' ?'#include "Libraries/Scheduler/Scheduler_Common.h"' : '#include "Scheduler_Common.h"'
}
${
    settings.version == 'v2.0' ?'#include "Libraries/UART/UARTDriver.h"' : '#include "UARTDriver.h"'
}
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
`;

    return code;
};

Offboardlink.listMsgsAsync = function(func) {
    let dir = './data/msgs/';
    let _item_list = [];

    let promise = new Promise(function(resolve, reject) {
        fs.readdir(dir, function(err, files) {
            if (err) {
                console.warn(err, "读取文件夹错误！");
                reject();
            } else {
                for(let i = 0; i < files.length; i ++) {
                    let file_path = path.join(dir, files[i]);
                    fs.readFile(file_path, {encoding: 'utf-8'}, (err, res) => {
                        if(err){
                            mylog(err);
                            // reject();
                        } else {
                            let msg = JSON.parse(res);
                            let msg_obj = Offboardlink.Message(files[i].split('.')[0], msg);
                            // mylog(msg_obj);
                            if(Offboardlink.checkMsgValid(msg)) {
                                _item_list.push(func(msg_obj).item);
                                // mylog(files.length);
                            }
                            else {
                                // reject();
                            }
                            // let length = Offboardlink.Message(msg).getDataLen();
                            // resolve(Offboardlink.Message(msg))
                            // mylog(files[i] + ': ' + length + ' ' + Offboardlink.checkMsgValid(msg) + ' ' + Offboardlink.checkDataValid(msg.data_list[0]));
                        }
                    });
                }
                setTimeout(function _check_length(files) {
                    if(_item_list.length == files.length) {
                        mylog("all files read!!!");
                        resolve(_item_list);
                    }
                    else {
                        setTimeout(_check_length, 10, files);
                    }
                }, 10, files);
            }
        });
    });

    return promise;
}

Offboardlink.listScriptsAsync = function() {
    let dir = './data/scripts/modules/';
    let _item_list = [];

    let promise = new Promise(function(resolve, reject) {
        fs.readdir(dir, function(err, files) {
            if (err) {
                console.warn(err, "读取文件夹错误！");
                reject();
            } else {
                for(let i = 0; i < files.length; i ++) {
                    let file_path = path.join(dir, files[i]);
                    fs.readFile(file_path, {encoding: 'utf-8'}, (err, res) => {
                        if(err){
                            mylog(err);
                            // reject();
                        } else {
                            _item_list.push(files[i].split('.')[0]);
                            // mylog(files[i] + ': ' + length + ' ' + Offboardlink.checkMsgValid(msg) + ' ' + Offboardlink.checkDataValid(msg.data_list[0]));
                        }
                    });
                }
                setTimeout(function _check_length(files) {
                    if(_item_list.length == files.length) {
                        mylog("all scripts read!!!");
                        resolve(_item_list);
                    }
                    else {
                        setTimeout(_check_length, 10, files);
                    }
                }, 10, files);
            }
        });
    });

    return promise;
}

Offboardlink.unitTest = function() {
    let dir = './data/msgs/';

    fs.readdir(dir, function(err, files) {
        if (err) {
            console.warn(err, "读取文件夹错误！")
        } else {
            for(let i = 0; i < files.length; i ++) {
                let file_path = path.join(dir, files[i]);
                fs.readFile(file_path, {encoding: 'utf-8'}, (err, res) => {
                    if(err){
                        mylog(err)
                    } else {
                        let msg = JSON.parse(res);
                        let length = Offboardlink.Message(msg).getDataLen();
                        mylog(files[i] + ': ' + length + ' ' + Offboardlink.checkMsgValid(msg) + ' ' + Offboardlink.checkDataValid(msg.data_list[0]));
                    }
                });
            }
        }
    });

    // fs.readFile(file, {encoding: 'utf-8'}, (err, res) => {
    //     if(err){
    //         mylog(err)
    //     } else {
    //         let msg = JSON.parse(res);
    //         // let length = Offboardlink.Message(msg).getDataLen();
    //         mylog(Offboardlink.checkMsgValid(msg) + ' ' + Offboardlink.checkDataValid(msg.data_list[0]));
    //     }
    // })
};

module.exports = {
    Offboardlink: Offboardlink,
    mylog : mylog
};

// Offboardlink.unitTest();
