/*****************************************************************
**                ��������ѧ ��BUGս��
**    û��ʲô������һ��ͨ��������˵ģ�������Ǿ���������
**---------------------------------------------------------------
** ��Ŀ���ƣ�   mxdemo_std_robot
** ��    �ڣ�   2021-04-15
** ��    �ߣ�   
**---------------------------------------------------------------
** �� �� ����   referee_system.c
** �ļ�˵����   ����ϵͳЭ������Ϳͻ���UI����
** �ļ�ע�ͣ�   
*****************************************************************/

/*---------------------INCLUDES----------------------*/
#include "referee_system.h"
#include "usart.h"

/*---------------------VARIABLES---------------------*/
//ʹ��CCM����RAM��(0x10005000-0x10007FFF 12KB)

//uint8_t referee_fifo_buf[REFEREE_FIFO_BUF_NUM][REFEREE_FIFO_BUF_LEN] __attribute__((at(0x10005000))) = {0}; //8*1KB
//uint8_t fifo_count __attribute__((at(0x10007C00))) = 0;
//uint8_t fifo_head_pos __attribute__((at(0x10007C04))) = 0;
//uint8_t fifo_tail_pos __attribute__((at(0x10007C08))) = 0;

//uint8_t referee_seq_num __attribute__((at(0x10007C10))) = 0;
//uint8_t student_interactive_seq __attribute__((at(0x10007C14))) = 0;

//RobotRefereeStatus_t robot_referee_status __attribute__((at(0x10007000))) = {0};
//ClientUIStatus_t client_ui_status __attribute__((at(0x10007800))) = {0};
uint8_t referee_fifo_buf[REFEREE_FIFO_BUF_NUM][REFEREE_FIFO_BUF_LEN] = {0}; //8*1KB
uint8_t fifo_count = 0;
uint8_t fifo_head_pos  = 0;
uint8_t fifo_tail_pos  = 0;

uint8_t referee_seq_num  = 0;
uint8_t student_interactive_seq  = 0;

RobotRefereeStatus_t robot_referee_status  = {0};
ClientUIStatus_t client_ui_status = {0};

target target_position ={0};
 

#define DevX 0 //UIƫ����������ͼ����װ����
#define DevY 0

/*---------------------FUNCTIONS---------------------*/

/*---------------------DJI�ṩCRCУ�����---------------------*/
//crc8 generator polynomial:G(x)=x8+x5+x4+1
const uint8_t CRC8_INIT = 0xff;
const uint8_t CRC8_TAB[256] = {0x00, 0x5e, 0xbc, 0xe2, 0x61, 0x3f, 0xdd, 0x83, 0xc2, 0x9c, 0x7e,
                               0x20, 0xa3, 0xfd, 0x1f, 0x41, 0x9d, 0xc3, 0x21, 0x7f, 0xfc, 0xa2, 0x40, 0x1e, 0x5f, 0x01, 0xe3,
                               0xbd, 0x3e, 0x60, 0x82, 0xdc, 0x23, 0x7d, 0x9f, 0xc1, 0x42, 0x1c, 0xfe, 0xa0, 0xe1, 0xbf, 0x5d,
                               0x03, 0x80, 0xde, 0x3c, 0x62, 0xbe, 0xe0, 0x02, 0x5c, 0xdf, 0x81, 0x63, 0x3d, 0x7c, 0x22, 0xc0,
                               0x9e, 0x1d, 0x43, 0xa1, 0xff, 0x46, 0x18, 0xfa, 0xa4, 0x27, 0x79, 0x9b, 0xc5, 0x84, 0xda, 0x38,
                               0x66, 0xe5, 0xbb, 0x59, 0x07, 0xdb, 0x85, 0x67, 0x39, 0xba, 0xe4, 0x06, 0x58, 0x19, 0x47, 0xa5,
                               0xfb, 0x78, 0x26, 0xc4, 0x9a, 0x65, 0x3b, 0xd9, 0x87, 0x04, 0x5a, 0xb8, 0xe6, 0xa7, 0xf9, 0x1b,
                               0x45, 0xc6, 0x98, 0x7a, 0x24, 0xf8, 0xa6, 0x44, 0x1a, 0x99, 0xc7, 0x25, 0x7b, 0x3a, 0x64, 0x86,
                               0xd8, 0x5b, 0x05, 0xe7, 0xb9, 0x8c, 0xd2, 0x30, 0x6e, 0xed, 0xb3, 0x51, 0x0f, 0x4e, 0x10, 0xf2,
                               0xac, 0x2f, 0x71, 0x93, 0xcd, 0x11, 0x4f, 0xad, 0xf3, 0x70, 0x2e, 0xcc, 0x92, 0xd3, 0x8d, 0x6f,
                               0x31, 0xb2, 0xec, 0x0e, 0x50, 0xaf, 0xf1, 0x13, 0x4d, 0xce, 0x90, 0x72, 0x2c, 0x6d, 0x33, 0xd1,
                               0x8f, 0x0c, 0x52, 0xb0, 0xee, 0x32, 0x6c, 0x8e, 0xd0, 0x53, 0x0d, 0xef, 0xb1, 0xf0, 0xae, 0x4c,
                               0x12, 0x91, 0xcf, 0x2d, 0x73, 0xca, 0x94, 0x76, 0x28, 0xab, 0xf5, 0x17, 0x49, 0x08, 0x56, 0xb4,
                               0xea, 0x69, 0x37, 0xd5, 0x8b, 0x57, 0x09, 0xeb, 0xb5, 0x36, 0x68, 0x8a, 0xd4, 0x95, 0xcb, 0x29,
                               0x77, 0xf4, 0xaa, 0x48, 0x16, 0xe9, 0xb7, 0x55, 0x0b, 0x88, 0xd6, 0x34, 0x6a, 0x2b, 0x75, 0x97,
                               0xc9, 0x4a, 0x14, 0xf6, 0xa8, 0x74, 0x2a, 0xc8, 0x96, 0x15, 0x4b, 0xa9, 0xf7, 0xb6, 0xe8, 0x0a,
                               0x54, 0xd7, 0x89, 0x6b, 0x35};

/**
  * @brief          ����CRC8
  * @param[in]      pch_message: ����
  * @param[in]      dw_length: ���ݺ�У��ĳ���
  * @param[in]      ucCRC8:��ʼCRC8
  * @retval         �������CRC8
  */
uint8_t Get_CRC8_Check_Sum(uint8_t *pchMessage, uint32_t dwLength, uint8_t ucCRC8)
{
  uint8_t ucIndex;
  while (dwLength--)
  {
    ucIndex = ucCRC8 ^ (*pchMessage++);
    ucCRC8 = CRC8_TAB[ucIndex];
  }
  return (ucCRC8);
}

/**
  * @brief          CRC8У�麯��
  * @param[in]      pch_message: ����
  * @param[in]      dw_length: ���ݺ�У��ĳ���
  * @retval         ����߼�
  */
uint32_t Verify_CRC8_Check_Sum(uint8_t *pchMessage, uint32_t dwLength)
{
  uint8_t ucExpected;
  ucExpected = Get_CRC8_Check_Sum(pchMessage, dwLength - 1, CRC8_INIT);
  return (ucExpected == pchMessage[dwLength - 1]);
}

/**
  * @brief          ���CRC8�����ݵĽ�β
  * @param[in]      pch_message: ����
  * @param[in]      dw_length: ���ݺ�У��ĳ���
  * @retval         none
  */
void Append_CRC8_Check_Sum(uint8_t *pchMessage, uint32_t dwLength)
{
  uint8_t ucCRC;
  ucCRC = Get_CRC8_Check_Sum(pchMessage, dwLength - 1, CRC8_INIT);
  pchMessage[dwLength - 1] = ucCRC;
}

//crc16
const uint16_t CRC16_INIT = 0xffff;
const uint16_t CRC16_Table[256] = {0x0000, 0x1189, 0x2312, 0x329b, 0x4624, 0x57ad, 0x6536, 0x74bf, 0x8c48, 0x9dc1, 0xaf5a, 0xbed3,
                                   0xca6c, 0xdbe5, 0xe97e, 0xf8f7, 0x1081, 0x0108, 0x3393, 0x221a, 0x56a5, 0x472c, 0x75b7, 0x643e, 0x9cc9, 0x8d40, 0xbfdb, 0xae52,
                                   0xdaed, 0xcb64, 0xf9ff, 0xe876, 0x2102, 0x308b, 0x0210, 0x1399, 0x6726, 0x76af, 0x4434, 0x55bd, 0xad4a, 0xbcc3, 0x8e58, 0x9fd1,
                                   0xeb6e, 0xfae7, 0xc87c, 0xd9f5, 0x3183, 0x200a, 0x1291, 0x0318, 0x77a7, 0x662e, 0x54b5, 0x453c, 0xbdcb, 0xac42, 0x9ed9, 0x8f50,
                                   0xfbef, 0xea66, 0xd8fd, 0xc974, 0x4204, 0x538d, 0x6116, 0x709f, 0x0420, 0x15a9, 0x2732, 0x36bb, 0xce4c, 0xdfc5, 0xed5e, 0xfcd7,
                                   0x8868, 0x99e1, 0xab7a, 0xbaf3, 0x5285, 0x430c, 0x7197, 0x601e, 0x14a1, 0x0528, 0x37b3, 0x263a, 0xdecd, 0xcf44, 0xfddf, 0xec56,
                                   0x98e9, 0x8960, 0xbbfb, 0xaa72, 0x6306, 0x728f, 0x4014, 0x519d, 0x2522, 0x34ab, 0x0630, 0x17b9, 0xef4e, 0xfec7, 0xcc5c, 0xddd5,
                                   0xa96a, 0xb8e3, 0x8a78, 0x9bf1, 0x7387, 0x620e, 0x5095, 0x411c, 0x35a3, 0x242a, 0x16b1, 0x0738, 0xffcf, 0xee46, 0xdcdd, 0xcd54,
                                   0xb9eb, 0xa862, 0x9af9, 0x8b70, 0x8408, 0x9581, 0xa71a, 0xb693, 0xc22c, 0xd3a5, 0xe13e, 0xf0b7, 0x0840, 0x19c9, 0x2b52, 0x3adb,
                                   0x4e64, 0x5fed, 0x6d76, 0x7cff, 0x9489, 0x8500, 0xb79b, 0xa612, 0xd2ad, 0xc324, 0xf1bf, 0xe036, 0x18c1, 0x0948, 0x3bd3, 0x2a5a,
                                   0x5ee5, 0x4f6c, 0x7df7, 0x6c7e, 0xa50a, 0xb483, 0x8618, 0x9791, 0xe32e, 0xf2a7, 0xc03c, 0xd1b5, 0x2942, 0x38cb, 0x0a50, 0x1bd9,
                                   0x6f66, 0x7eef, 0x4c74, 0x5dfd, 0xb58b, 0xa402, 0x9699, 0x8710, 0xf3af, 0xe226, 0xd0bd, 0xc134, 0x39c3, 0x284a, 0x1ad1, 0x0b58,
                                   0x7fe7, 0x6e6e, 0x5cf5, 0x4d7c, 0xc60c, 0xd785, 0xe51e, 0xf497, 0x8028, 0x91a1, 0xa33a, 0xb2b3, 0x4a44, 0x5bcd, 0x6956, 0x78df,
                                   0x0c60, 0x1de9, 0x2f72, 0x3efb, 0xd68d, 0xc704, 0xf59f, 0xe416, 0x90a9, 0x8120, 0xb3bb, 0xa232, 0x5ac5, 0x4b4c, 0x79d7, 0x685e,
                                   0x1ce1, 0x0d68, 0x3ff3, 0x2e7a, 0xe70e, 0xf687, 0xc41c, 0xd595, 0xa12a, 0xb0a3, 0x8238, 0x93b1, 0x6b46, 0x7acf, 0x4854, 0x59dd,
                                   0x2d62, 0x3ceb, 0x0e70, 0x1ff9, 0xf78f, 0xe606, 0xd49d, 0xc514, 0xb1ab, 0xa022, 0x92b9, 0x8330, 0x7bc7, 0x6a4e, 0x58d5, 0x495c,
                                   0x3de3, 0x2c6a, 0x1ef1, 0x0f78};


/**
  * @brief          ����CRC16
  * @param[in]      pch_message: ����
  * @param[in]      dw_length: ���ݺ�У��ĳ���
  * @param[in]      wCRC:��ʼCRC16
  * @retval         �������CRC16
  */
uint16_t Get_CRC16_Check_Sum(uint8_t *pchMessage, uint32_t dwLength, uint16_t wCRC)
{
  uint8_t chData;
  while (dwLength--)
  {
    chData = *pchMessage++;
    wCRC = (wCRC >> 8) ^ CRC16_Table[(wCRC ^ (uint16_t)(chData)) & 0x00ff];
  }
  return wCRC;
}

/**
  * @brief          CRC16У�麯��
  * @param[in]      pch_message: ����
  * @param[in]      dw_length: ���ݺ�У��ĳ���
  * @retval         ����߼�
  */
uint32_t Verify_CRC16_Check_Sum(uint8_t *pchMessage, uint32_t dwLength)
{
  uint16_t wExpected;
  wExpected = Get_CRC16_Check_Sum(pchMessage, dwLength - 2, CRC16_INIT);
  return ((wExpected & 0x00ff) == pchMessage[dwLength - 2] && ((wExpected >> 8) & 0x00ff) == pchMessage[dwLength - 1]);
}

/**
  * @brief          ���CRC16�����ݵĽ�β
  * @param[in]      pch_message: ����
  * @param[in]      dw_length: ���ݺ�У��ĳ���
  * @retval         none
  */
void Append_CRC16_Check_Sum(uint8_t *pchMessage, uint32_t dwLength)
{
  uint16_t wCRC;
  wCRC = Get_CRC16_Check_Sum(pchMessage, dwLength - 2, CRC16_INIT);
  pchMessage[dwLength - 2] = (wCRC & 0x00ff);
  pchMessage[dwLength - 1] = ((wCRC >> 8) & 0x00ff);
}
/***********************************************************************
** �� �� ���� PushToRefereeFIFOBuf()
** ����˵���� �Ӵ���DMA�Ľ��ջ���ѭ����������ȡ����֡,ѹ�����ϵͳЭ������������(��UART�жϵ���)
**---------------------------------------------------------------------
** ��������� ����DMA���ջ��������ַ,������󳤶�,��ʼλ��,����λ��
** ���ز����� ��
***********************************************************************/
void PushToRefereeFIFOBuf(uint8_t *pdata, uint16_t max_size, uint16_t start_pos, uint16_t end_pos)
{
  uint16_t size;

  if (end_pos >= start_pos)
  {
    size = end_pos - start_pos;
  }
  else
  {
    size = max_size - (start_pos - end_pos);
  }

  if ((size > 0) && (fifo_count < REFEREE_FIFO_BUF_NUM))
  {
    //
    referee_fifo_buf[fifo_tail_pos][0] = size >> 8;
    referee_fifo_buf[fifo_tail_pos][1] = size;

    if (end_pos > start_pos)
    {
      memcpy(referee_fifo_buf[fifo_tail_pos] + 2, pdata + start_pos, size);
    }
    else
    {
      memcpy(referee_fifo_buf[fifo_tail_pos] + 2, pdata + start_pos, max_size - start_pos);
      memcpy(referee_fifo_buf[fifo_tail_pos] + 2 + (max_size - start_pos), pdata, end_pos);
    }

    //
    fifo_tail_pos = (fifo_tail_pos + 1) % REFEREE_FIFO_BUF_NUM;
    fifo_count++;
  }
}


/***********************************************************************
** �� �� ���� ParseRefereeSystemData()
** ����˵���� ����ϵͳЭ�����(��100Hz��ʱ���жϵ���)
**---------------------------------------------------------------------
** ��������� ��
** ���ز����� ��
***********************************************************************/
void ParseRefereeSystemData(void)
{
  int16_t remaining_n;

  uint8_t *pbuf;
  uint8_t *ptr; //����float��uint64_t��������ת��

  uint16_t data_len;
  uint16_t cmd;
	
if (fifo_count > 0)
{
  remaining_n = referee_fifo_buf[fifo_head_pos][0] * 256 + referee_fifo_buf[fifo_head_pos][1];
  pbuf = referee_fifo_buf[fifo_head_pos] + 2;      //��ȡframe-header��ʼλ��
  while (1)
    {
	  if ((pbuf[0] == 0xA5) && (remaining_n >= 5)) //����frame_header������֡��ʼ�ֽڣ��̶�ֵΪ 0xA5��������length�Ƿ���ȷ
     {
		  if (Verify_CRC8_Check_Sum(pbuf, 5)) //����frame-head_crc8У�����Ƿ���ȷ
         {
		    data_len = pbuf[2] * 256 + pbuf[1]; //����֡�� data �ĳ���
          if (pbuf[3] != (uint8_t)(referee_seq_num + 1))
           {
            robot_referee_status.cmd_error_count[0]++;
            } //seq_num����Ŵ���
			   referee_seq_num = pbuf[3];
			 if (remaining_n >= data_len + 9) //5+2+len+2 //check package length
          {
            if (Verify_CRC16_Check_Sum(pbuf, data_len + 9)) //У��crc16	
			    {					
					cmd = pbuf[6] * 256 + pbuf[5];//���ݵĵ�������λ����ȡcmd-id
					 
					if (cmd == 0x0100) //10Hz,������״̬����
              {
								
					// -------------------------Ŀ��λ�����ݽ���--------------------------------------------
								target_position.x = pbuf[8]*256+pbuf[7];
								target_position.y = pbuf[10]*256+pbuf[9];
								target_position.yaw =pbuf[11];
								target_position.rubbish_class =pbuf[12];
								target_position.flag = pbuf[13];
													
								
					// -------------------------Ŀ��λ�����ݽ���--------------------------------------------
								
								
								
 /*               robot_referee_status.game_robot_status.recv_cnt++;       //�Ѿ��������ݼ�¼

                robot_referee_status.game_robot_status.robot_id = pbuf[7];       
                robot_referee_status.game_robot_status.robot_level = pbuf[8];    

                robot_referee_status.game_robot_status.remain_HP = pbuf[10] * 256 + pbuf[9];   
                robot_referee_status.game_robot_status.max_HP = pbuf[12] * 256 + pbuf[11];
					  
					 robot_referee_status.game_robot_status.shooter_id1_42mm_cooling_rate = pbuf[26] * 256 + pbuf[25];
                robot_referee_status.game_robot_status.shooter_id1_42mm_cooling_limit = pbuf[28] * 256 + pbuf[27];
                robot_referee_status.game_robot_status.shooter_id1_42mm_speed_limit = pbuf[30] * 256 + pbuf[29];

                robot_referee_status.game_robot_status.chassis_power_limit = pbuf[32] * 256 + pbuf[31];

                robot_referee_status.game_robot_status.mains_power_gimbal_output = pbuf[33];
                robot_referee_status.game_robot_status.mains_power_chassis_output = pbuf[33] >> 1;
                robot_referee_status.game_robot_status.mains_power_shooter_output = pbuf[33] >> 2;
								
								ptr = (uint8_t *)&robot_referee_status.game_robot_pos.yaw;
                ptr[0] = pbuf[19];
                ptr[1] = pbuf[20];
                ptr[2] = pbuf[21];
                ptr[3] = pbuf[22];*/
              }

				  else //cmd error
              {
                robot_referee_status.cmd_error_count[5]++;
              }
	          }
	          else //check package_crc16 error
            {
              robot_referee_status.cmd_error_count[4]++;
              break;
            } 
			  }
          else //check package length error
         {
          robot_referee_status.cmd_error_count[3]++;
          break;
          }		  
			}
			else //check head_crc8 error
        {
         robot_referee_status.cmd_error_count[2]++;
         break;
        }
	    }
		 else //check frame_header & length error
     {
        robot_referee_status.cmd_error_count[1]++;
        break;
     }
	   remaining_n = remaining_n - (data_len + 9);
      pbuf = pbuf + (data_len + 9);
	  
	   if (remaining_n <= 0)
      {
        break;
      }
    }
	 
    fifo_head_pos = (fifo_head_pos + 1) % REFEREE_FIFO_BUF_NUM;
    fifo_count--;
  }
}



/*---------------------�����˼�ͨ����ͻ���UI����---------------------*/


/***********************************************************************
** �� �� ���� create_ui_interactive_package()
** ����˵���� ���������˺Ϳͻ���UIͨ������֡����(δ������ݶ�)
**---------------------------------------------------------------------
** ��������� ����֡��������ַ, ����֡����������, ���ݶ�����id
** ���ز����� ��
***********************************************************************/
void create_ui_interactive_package(uint8_t *tx_buf, uint8_t tx_buf_len, uint16_t data_cmd_id)
{
  //4 bytes
  frame_header_t *p_frame_header = (frame_header_t *)(tx_buf + 0);
  p_frame_header->sof = 0xA5;
  p_frame_header->data_length = tx_buf_len - 9; //���ݳ���
  p_frame_header->seq = student_interactive_seq++;

  //1 bytes
  Append_CRC8_Check_Sum(tx_buf, 5);

  //2 bytes
  uint16_t cmd_id = 0x0301; //��������ָ��
  memcpy(tx_buf + 5, &cmd_id, sizeof(cmd_id));

  //6 bytes
  ext_student_interactive_header_data_t *p_student_interacitve_header = (ext_student_interactive_header_data_t *)(tx_buf + 7);
  p_student_interacitve_header->data_cmd_id = data_cmd_id;
  p_student_interacitve_header->sender_ID = robot_referee_status.game_robot_status.robot_id;
  p_student_interacitve_header->receiver_ID = robot_referee_status.game_robot_status.robot_id + 0x0100;

  //���ݶ�(����ǰ����)

  //2 bytes
  Append_CRC16_Check_Sum(tx_buf, tx_buf_len);
}

/***********************************************************************
** �� �� ���� set_clear_graphics_data()
** ����˵���� ����UI���ݶ�����:ɾ��ͼ��
**---------------------------------------------------------------------
** ��������� UI���ݶλ�������ַ,����,ͼ��
** ���ز����� ��
***********************************************************************/
void set_clear_graphics_data(uint8_t *tx_buf, uint8_t operate, uint8_t layer)
{
  ext_client_custom_graphic_delete_t *p_client_custom_graphic_delete = (ext_client_custom_graphic_delete_t *)(tx_buf + 0);

  p_client_custom_graphic_delete->operate_type = operate; //0-�ղ���;1-ɾ��ͼ��;2-ɾ������
  p_client_custom_graphic_delete->layer = layer;          //ͼ����0-9
}

/***********************************************************************
** �� �� ���� set_line_graphics_data()
** ����˵���� ����UI���ݶ�����:ֱ������
**---------------------------------------------------------------------
** ��������� UI���ݶλ�������ַ,ͼ����,ͼ����,����,�߿�,��ɫ,���x,���y,�յ�x,�յ�y
** ���ز����� ��
***********************************************************************/
void set_line_graphics_data(uint8_t *tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t end_x, uint16_t end_y)
{
  graphic_data_struct_t *p_graphic_data_struct = (graphic_data_struct_t *)(tx_buf + 0);

  p_graphic_data_struct->graphic_name[0] = name[0];
  p_graphic_data_struct->graphic_name[1] = name[1];
  p_graphic_data_struct->graphic_name[2] = name[2];
  p_graphic_data_struct->operate_tpye = operate;                      //0-��;1-����;2-�޸�;3-ɾ��
  p_graphic_data_struct->graphic_tpye = 0;                            //0-ֱ��;1-����;2-��Բ;3-��Բ;4-Բ��;5-������;6-������;7-�ַ�
  p_graphic_data_struct->layer = layer;                               //ͼ��0-9
  p_graphic_data_struct->color = color;                               //0-������ɫ;1-��ɫ;2-��ɫ;3-��ɫ;4-�Ϻ�ɫ;5-��ɫ;6-��ɫ;7-��ɫ;8-��ɫ
  p_graphic_data_struct->start_angle = 0;                             //��
  p_graphic_data_struct->end_angle = 0;                               //��
  p_graphic_data_struct->width = width;                               //�������
  p_graphic_data_struct->start_x = start_x + DevX;                    //���x����
  p_graphic_data_struct->start_y = start_y + DevY;                    //���y����
  p_graphic_data_struct->graphic_config_3.value.radius = 0;           //��
  p_graphic_data_struct->graphic_config_3.value.end_x = end_x + DevX; //�յ�x����
  p_graphic_data_struct->graphic_config_3.value.end_y = end_y + DevY; //�յ�y����
}

/***********************************************************************
** �� �� ���� set_rectangle_graphics_data()
** ����˵���� ����UI���ݶ�����:��������
**---------------------------------------------------------------------
** ��������� UI���ݶλ�������ַ,ͼ����,ͼ����,����,�߿�,��ɫ,���x,���y,�ԽǶ���x,�ԽǶ���y
** ���ز����� ��
***********************************************************************/
void set_rectangle_graphics_data(uint8_t *tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t opposite_x, uint16_t opposite_y)
{
  graphic_data_struct_t *p_graphic_data_struct = (graphic_data_struct_t *)(tx_buf + 0);

  p_graphic_data_struct->graphic_name[0] = name[0];
  p_graphic_data_struct->graphic_name[1] = name[1];
  p_graphic_data_struct->graphic_name[2] = name[2];
  p_graphic_data_struct->operate_tpye = operate;                           //0-��;1-����;2-�޸�;3-ɾ��
  p_graphic_data_struct->graphic_tpye = 1;                                 //0-ֱ��;1-����;2-��Բ;3-��Բ;4-Բ��;5-������;6-������;7-�ַ�
  p_graphic_data_struct->layer = layer;                                    //ͼ��0-9
  p_graphic_data_struct->color = color;                                    //0-������ɫ;1-��ɫ;2-��ɫ;3-��ɫ;4-�Ϻ�ɫ;5-��ɫ;6-��ɫ;7-��ɫ;8-��ɫ
  p_graphic_data_struct->start_angle = 0;                                  //��
  p_graphic_data_struct->end_angle = 0;                                    //��
  p_graphic_data_struct->width = width;                                    //�������
  p_graphic_data_struct->start_x = start_x + DevX;                         //���x����
  p_graphic_data_struct->start_y = start_y + DevY;                         //���y����
  p_graphic_data_struct->graphic_config_3.value.radius = 0;                //��
  p_graphic_data_struct->graphic_config_3.value.end_x = opposite_x + DevX; //�ԽǶ���x����
  p_graphic_data_struct->graphic_config_3.value.end_y = opposite_y + DevY; //�ԽǶ���y����
}

/***********************************************************************
** �� �� ���� set_circle_graphics_data()
** ����˵���� ����UI���ݶ�����:��Բ����
**---------------------------------------------------------------------
** ��������� UI���ݶλ�������ַ,ͼ����,ͼ����,����,�߿�,��ɫ,Բ��x,Բ��y,�뾶
** ���ز����� ��
***********************************************************************/
void set_circle_graphics_data(uint8_t *tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t center_x, uint16_t center_y, uint16_t radius)
{
  graphic_data_struct_t *p_graphic_data_struct = (graphic_data_struct_t *)(tx_buf + 0);

  p_graphic_data_struct->graphic_name[0] = name[0];
  p_graphic_data_struct->graphic_name[1] = name[1];
  p_graphic_data_struct->graphic_name[2] = name[2];
  p_graphic_data_struct->operate_tpye = operate;                 //0-��;1-����;2-�޸�;3-ɾ��
  p_graphic_data_struct->graphic_tpye = 2;                       //0-ֱ��;1-����;2-��Բ;3-��Բ;4-Բ��;5-������;6-������;7-�ַ�
  p_graphic_data_struct->layer = layer;                          //ͼ��0-9
  p_graphic_data_struct->color = color;                          //0-������ɫ;1-��ɫ;2-��ɫ;3-��ɫ;4-�Ϻ�ɫ;5-��ɫ;6-��ɫ;7-��ɫ;8-��ɫ
  p_graphic_data_struct->start_angle = 0;                        //��
  p_graphic_data_struct->end_angle = 0;                          //��
  p_graphic_data_struct->width = width;                          //�������
  p_graphic_data_struct->start_x = center_x + DevX;              //Բ��x����
  p_graphic_data_struct->start_y = center_y + DevY;              //Բ��y����
  p_graphic_data_struct->graphic_config_3.value.radius = radius; //�뾶
  p_graphic_data_struct->graphic_config_3.value.end_x = 0;       //��
  p_graphic_data_struct->graphic_config_3.value.end_y = 0;       //��
}
/***********************************************************************
** �� �� ���� set_ellipse_graphics_data()
** ����˵���� ����UI���ݶ�����:��Բ����
**---------------------------------------------------------------------
** ��������� UI���ݶλ�������ַ,ͼ����,ͼ����,����,�߿�,��ɫ,Բ��x,Բ��y,����x,����y
** ���ز����� ��
***********************************************************************/
void set_ellipse_graphics_data(uint8_t *tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t center_x, uint16_t center_y, uint16_t half_axis_x, uint16_t half_axis_y)
{
  graphic_data_struct_t *p_graphic_data_struct = (graphic_data_struct_t *)(tx_buf + 0);

  p_graphic_data_struct->graphic_name[0] = name[0];
  p_graphic_data_struct->graphic_name[1] = name[1];
  p_graphic_data_struct->graphic_name[2] = name[2];
  p_graphic_data_struct->operate_tpye = operate;                     //0-��;1-����;2-�޸�;3-ɾ��
  p_graphic_data_struct->graphic_tpye = 3;                           //0-ֱ��;1-����;2-��Բ;3-��Բ;4-Բ��;5-������;6-������;7-�ַ�
  p_graphic_data_struct->layer = layer;                              //ͼ��0-9
  p_graphic_data_struct->color = color;                              //0-������ɫ;1-��ɫ;2-��ɫ;3-��ɫ;4-�Ϻ�ɫ;5-��ɫ;6-��ɫ;7-��ɫ;8-��ɫ
  p_graphic_data_struct->start_angle = 0;                            //��
  p_graphic_data_struct->end_angle = 0;                              //��
  p_graphic_data_struct->width = width;                              //�������
  p_graphic_data_struct->start_x = center_x + DevX;                  //Բ��x����
  p_graphic_data_struct->start_y = center_y + DevY;                  //Բ��y����
  p_graphic_data_struct->graphic_config_3.value.radius = 0;          //��
  p_graphic_data_struct->graphic_config_3.value.end_x = half_axis_x; //����x����
  p_graphic_data_struct->graphic_config_3.value.end_y = half_axis_y; //����y����
}

/***********************************************************************
** �� �� ���� set_arc_graphics_data()
** ����˵���� ����UI���ݶ�����:Բ������
**---------------------------------------------------------------------
** ��������� UI���ݶλ�������ַ,ͼ����,ͼ����,����,�߿�,��ɫ,��ʼ�Ƕ�,��ֹ�Ƕ�,Բ��x,Բ��y,����x,����y
** ���ز����� ��
***********************************************************************/
void set_arc_graphics_data(uint8_t *tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_angle, uint16_t end_angle, uint16_t center_x, uint16_t center_y, uint16_t half_axis_x, uint16_t half_axis_y)
{
  graphic_data_struct_t *p_graphic_data_struct = (graphic_data_struct_t *)(tx_buf + 0);

  p_graphic_data_struct->graphic_name[0] = name[0];
  p_graphic_data_struct->graphic_name[1] = name[1];
  p_graphic_data_struct->graphic_name[2] = name[2];
  p_graphic_data_struct->operate_tpye = operate;                     //0-��;1-����;2-�޸�;3-ɾ��
  p_graphic_data_struct->graphic_tpye = 4;                           //0-ֱ��;1-����;2-��Բ;3-��Բ;4-Բ��;5-������;6-������;7-�ַ�
  p_graphic_data_struct->layer = layer;                              //ͼ��0-9
  p_graphic_data_struct->color = color;                              //0-������ɫ;1-��ɫ;2-��ɫ;3-��ɫ;4-�Ϻ�ɫ;5-��ɫ;6-��ɫ;7-��ɫ;8-��ɫ
  p_graphic_data_struct->start_angle = start_angle;                  //��ʼ�Ƕ�
  p_graphic_data_struct->end_angle = end_angle;                      //��ֹ�Ƕ�
  p_graphic_data_struct->width = width;                              //�������
  p_graphic_data_struct->start_x = center_x + DevX;                  //Բ��x����
  p_graphic_data_struct->start_y = center_y + DevY;                  //Բ��y����
  p_graphic_data_struct->graphic_config_3.value.radius = 0;          //��
  p_graphic_data_struct->graphic_config_3.value.end_x = half_axis_x; //����x����
  p_graphic_data_struct->graphic_config_3.value.end_y = half_axis_y; //����y����
}

/***********************************************************************
** �� �� ���� ClientUI_ClearLayer()
** ����˵���� ����ͻ�����ѡͼ���UIͼ��
**---------------------------------------------------------------------
** ��������� ͼ��
** ���ز����� ��
***********************************************************************/
void ClientUI_ClearLayer(uint8_t layer)
{
  uint8_t tx_buf[17] = {0};

  set_clear_graphics_data(tx_buf + 13, 1, layer);    //ɾ����ѡͼ��
  create_ui_interactive_package(tx_buf, 17, 0x0100); //�ͻ���ɾ��ͼ��

  HAL_UART_Transmit(&huart6, tx_buf, 17, 100); //��������֡
}

/***********************************************************************
** �� �� ���� ClientUI_DrawLine()
** ����˵���� �ͻ���UI��һ��ֱ��
**---------------------------------------------------------------------
** ��������� ͼ����,ͼ����,����,�߿�,��ɫ,���x,���y,�յ�x,�յ�y
** ���ز����� ��
***********************************************************************/
void ClientUI_DrawLine(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t end_x, uint16_t end_y)
{
  uint8_t tx_buf[30] = {0};

  set_line_graphics_data(tx_buf + 13, layer, name, operate, width, color, start_x, start_y, end_x, end_y); //����ֱ�߻�������
  create_ui_interactive_package(tx_buf, 30, 0x0101);                                                       //�ͻ��˻���һ��ͼ��

  HAL_UART_Transmit(&huart6, tx_buf, 30, 100); //��������֡
}

/***********************************************************************
** �� �� ���� ClientUI_DrawRectangle()
** ����˵���� �ͻ���UI��һ������
**---------------------------------------------------------------------
** ��������� ͼ����,ͼ����,����,�߿�,��ɫ,���x,���y,�ԽǶ���x,�ԽǶ���y
** ���ز����� ��
***********************************************************************/
void ClientUI_DrawRectangle(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t opposite_x, uint16_t opposite_y)
{
  uint8_t tx_buf[30] = {0};

  set_rectangle_graphics_data(tx_buf + 13, layer, name, operate, width, color, start_x, start_y, opposite_x, opposite_y); //���þ��λ�������
  create_ui_interactive_package(tx_buf, 30, 0x0101);                                                                      //�ͻ��˻���һ��ͼ��

  HAL_UART_Transmit(&huart6, tx_buf, 30, 100); //��������֡
}

/***********************************************************************
** �� �� ���� ClientUI_DrawCircle()
** ����˵���� �ͻ���UI��һ����Բ
**---------------------------------------------------------------------
** ��������� ͼ����,ͼ����,����,�߿�,��ɫ,Բ��x,Բ��y,�뾶
** ���ز����� ��
***********************************************************************/
void ClientUI_DrawCircle(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t center_x, uint16_t center_y, uint16_t radius)
{
  uint8_t tx_buf[30] = {0};

  set_circle_graphics_data(tx_buf + 13, layer, name, operate, width, color, center_x, center_y, radius); //������Բ��������
  create_ui_interactive_package(tx_buf, 30, 0x0101);                                                     //�ͻ��˻���һ��ͼ��

  HAL_UART_Transmit(&huart6, tx_buf, 30, 100); //��������֡
}

/***********************************************************************
** �� �� ���� ClientUI_DrawEllipse()
** ����˵���� �ͻ���UI��һ����Բ
**---------------------------------------------------------------------
** ��������� ͼ����,ͼ����,����,�߿�,��ɫ,Բ��x,Բ��y,����x,����y
** ���ز����� ��
***********************************************************************/
void ClientUI_DrawEllipse(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t center_x, uint16_t center_y, uint16_t half_axis_x, uint16_t half_axis_y)
{
  uint8_t tx_buf[30] = {0};

  set_ellipse_graphics_data(tx_buf + 13, layer, name, operate, width, color, center_x, center_y, half_axis_x, half_axis_y); //������Բ��������
  create_ui_interactive_package(tx_buf, 30, 0x0101);                                                                        //�ͻ��˻���һ��ͼ��

  HAL_UART_Transmit(&huart6, tx_buf, 30, 100); //��������֡
}

/***********************************************************************
** �� �� ���� ClientUI_DrawArc()
** ����˵���� �ͻ���UI��һ��Բ��
**---------------------------------------------------------------------
** ��������� ͼ����,ͼ����,����,�߿�,��ɫ,��ʼ�Ƕ�,��ֹ�Ƕ�,Բ��x,Բ��y,����x,����y
** ���ز����� ��
***********************************************************************/
void ClientUI_DrawArc(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_angle, uint16_t end_angle, uint16_t center_x, uint16_t center_y, uint16_t half_axis_x, uint16_t half_axis_y)
{
  uint8_t tx_buf[30] = {0};

  set_arc_graphics_data(tx_buf + 13, layer, name, operate, width, color, start_angle, end_angle, center_x, center_y, half_axis_x, half_axis_y); //����Բ����������
  create_ui_interactive_package(tx_buf, 30, 0x0101);                                                                                            //�ͻ��˻���һ��ͼ��

  HAL_UART_Transmit(&huart6, tx_buf, 30, 100); //��������֡
}

/***********************************************************************
** �� �� ���� ClientUI_DrawFloat()
** ����˵���� �ͻ���UI��һ��������(������)
**---------------------------------------------------------------------
** ��������� ͼ����,����,�����С,��ɫ,���x,���y,������ֵ
** ���ز����� ��
***********************************************************************/
/*void ClientUI_DrawFloat(char *name, uint8_t operate, uint8_t size, uint8_t color, uint16_t start_x, uint16_t start_y, float value)
{
	uint8_t tx_buf[30]={0};
	
	set_float_graphics_data(tx_buf+13, name, operate, size, color, start_x, start_y, value); //����������������
	create_ui_interactive_package(tx_buf, 30, 0x0101); //�ͻ��˻���һ��ͼ��
	
	HAL_UART_Transmit(&huart1, tx_buf, 30, 100); //��������֡
}*/

/***********************************************************************
** �� �� ���� ClientUI_DrawInteger()
** ����˵���� �ͻ���UI��һ�������������ã�
**---------------------------------------------------------------------
** ��������� ͼ����,����,�����С,��ɫ,���x,���y,����ֵ
** ���ز����� ��
***********************************************************************/
/*void ClientUI_DrawInteger(char *name, uint8_t operate, uint8_t size, uint8_t color, uint16_t start_x, uint16_t start_y, int32_t value)
{
	uint8_t tx_buf[30]={0};
	
	set_integer_graphics_data(tx_buf+13, name, operate, size, color, start_x, start_y, value); //����������������
	create_ui_interactive_package(tx_buf, 30, 0x0101); //�ͻ��˻���һ��ͼ��
	
	HAL_UART_Transmit(&huart1, tx_buf, 30, 100); //��������֡
}*/
/***********************************************************************
** �� �� ���� ClientUI_DrawString()
** ����˵���� �ͻ���UI����ʽ���ַ���
**---------------------------------------------------------------------
** ��������� ͼ����,ͼ����,����,�����С,��ɫ,���x,���y,��ʽ���ַ���
** ���ز����� ��
***********************************************************************/
void ClientUI_DrawString(uint8_t layer, char *name, uint8_t operate, uint8_t size, uint8_t color, uint16_t start_x, uint16_t start_y, const char *str, ...)
{
  uint8_t tx_buf[60] = {0};
  uint8_t len = 0;

  //4 bytes
  frame_header_t *p_frame_header = (frame_header_t *)(tx_buf + 0);
  p_frame_header->sof = 0xA5;
  p_frame_header->data_length = 51; //���ݳ���
  p_frame_header->seq = student_interactive_seq++;

  //1 byztes
  Append_CRC8_Check_Sum(tx_buf, 5);

  //2 bytes
  uint16_t cmd_id = 0x0301;
  memcpy(tx_buf + 5, &cmd_id, sizeof(cmd_id));

  //6 bytes
  ext_student_interactive_header_data_t *p_student_interacitve_header = (ext_student_interactive_header_data_t *)(tx_buf + 7);
  p_student_interacitve_header->data_cmd_id = 0x0110; //�ͻ��˻����ַ�ͼ��
  p_student_interacitve_header->sender_ID =1; //robot_referee_status.game_robot_status.robot_id;
  p_student_interacitve_header->receiver_ID =0x0101; //(robot_referee_status.game_robot_status.robot_id + 0x0100);

  //15+30 bytes
  ext_client_custom_character_t *p_client_custom_character = (ext_client_custom_character_t *)(tx_buf + 13);

  va_list ap;
  va_start(ap, str);
  len = vsprintf((char *)(p_client_custom_character->data), str, ap);
  va_end(ap);

  p_client_custom_character->grapic_data_struct.graphic_name[0] = name[0];
  p_client_custom_character->grapic_data_struct.graphic_name[1] = name[1];
  p_client_custom_character->grapic_data_struct.graphic_name[2] = name[2];
  p_client_custom_character->grapic_data_struct.operate_tpye = operate;            //0-��;1-����;2-�޸�;3-ɾ��
  p_client_custom_character->grapic_data_struct.graphic_tpye = 7;                  //0-ֱ��;1-����;2-��Բ;3-��Բ;4-Բ��;5-������;6-������;7-�ַ�
  p_client_custom_character->grapic_data_struct.layer = layer;                     //ͼ��0-9
  p_client_custom_character->grapic_data_struct.color = color;                     //0-������ɫ;1-��ɫ;2-��ɫ;3-��ɫ;4-�Ϻ�ɫ;5-��ɫ;6-��ɫ;7-��ɫ;8-��ɫ
  p_client_custom_character->grapic_data_struct.start_angle = size * 10;           //�����С
  p_client_custom_character->grapic_data_struct.end_angle = len;                   //�ַ�����
  p_client_custom_character->grapic_data_struct.width = size;                      //�������
  p_client_custom_character->grapic_data_struct.start_x = start_x + DevX;          //���x����
  p_client_custom_character->grapic_data_struct.start_y = start_y + DevY;          //���y����
  p_client_custom_character->grapic_data_struct.graphic_config_3.value.radius = 0; //��
  p_client_custom_character->grapic_data_struct.graphic_config_3.value.end_x = 0;  //��
  p_client_custom_character->grapic_data_struct.graphic_config_3.value.end_y = 0;  //��

  //2 bytes
  Append_CRC16_Check_Sum(tx_buf, 60);

  //
  HAL_UART_Transmit(&huart6, tx_buf, 60, 100); //��������֡
}

/***********************************************************************
** �� �� ���� RefreshDynamicClientUI()
** ����˵���� ˢ��(����)��̬�ͻ���UI����
**---------------------------------------------------------------------
** ��������� ��ϸ������Ϣ��ʾ���Ʊ�־λ
** ���ز����� ��
***********************************************************************/

//void RefreshDynamicClientUI(int8_t ui_show_detail_flag) //int8_t *ui_show_detail_flag
//{
//	ClientUI_DrawCircle(1, "CS1", UI_OPERATE_ADD, 2, UI_COLOR_YELLOW, 960, 540, 100);
//	
//}







