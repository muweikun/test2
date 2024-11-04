
/** @file
 *	@brief Offboardlink comm protocol generated from PathVisualize.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct PathVisualize : public MessageBase
    {
        public:
        uint8_t intention;
        uint16_t start_position_x;
        uint16_t start_position_y;
        int8_t delta_x[10];
        int8_t delta_y[10];
        
        PathVisualize() : MessageBase(0x43, 25)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			intention = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];
        
			start_position_x = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1];

			start_position_y = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3];

			delta_x[0] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5];
        
			delta_x[1] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6];
        
			delta_x[2] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7];
        
			delta_x[3] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8];
        
			delta_x[4] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9];
        
			delta_x[5] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10];
        
			delta_x[6] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 11];
        
			delta_x[7] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12];
        
			delta_x[8] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13];
        
			delta_x[9] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14];
        
			delta_y[0] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 15];
        
			delta_y[1] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 16];
        
			delta_y[2] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 17];
        
			delta_y[3] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 18];
        
			delta_y[4] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 19];
        
			delta_y[5] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 20];
        
			delta_y[6] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 21];
        
			delta_y[7] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 22];
        
			delta_y[8] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 23];
        
			delta_y[9] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 24];
        
        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = intention;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = start_position_x;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = (uint16_t)(start_position_x) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = start_position_y;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = (uint16_t)(start_position_y) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] = delta_x[0];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6] = delta_x[1];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7] = delta_x[2];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8] = delta_x[3];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9] = delta_x[4];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10] = delta_x[5];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 11] = delta_x[6];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12] = delta_x[7];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13] = delta_x[8];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14] = delta_x[9];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 15] = delta_y[0];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 16] = delta_y[1];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 17] = delta_y[2];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 18] = delta_y[3];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 19] = delta_y[4];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 20] = delta_y[5];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 21] = delta_y[6];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 22] = delta_y[7];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 23] = delta_y[8];

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 24] = delta_y[9];

        }
    };
}
        