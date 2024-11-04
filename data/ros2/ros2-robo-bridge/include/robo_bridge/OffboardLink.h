

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
