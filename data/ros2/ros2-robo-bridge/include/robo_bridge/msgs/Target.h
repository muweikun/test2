
/** @file
 *	@brief Offboardlink comm protocol generated from Target.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct Target : public MessageBase
    {
        public:
        uint16_t seq;
        uint8_t tracking;
        uint8_t armors_num;
        float pos_x;
        float pos_y;
        float pos_z;
        float vel_x;
        float vel_y;
        float vel_z;
        float yaw;
        float v_yaw;
        float radius_1;
        float radius_2;
        float dz;
        helper_float_u32 h;
            
        Target() : MessageBase(0xbb, 48)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			seq = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];

			tracking = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2];
        
			armors_num = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3];
        
			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4 + i];
            }
            pos_x = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8 + i];
            }
            pos_y = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12 + i];
            }
            pos_z = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 16 + i];
            }
            vel_x = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 20 + i];
            }
            vel_y = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 24 + i];
            }
            vel_z = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 28 + i];
            }
            yaw = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 32 + i];
            }
            v_yaw = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 36 + i];
            }
            radius_1 = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 40 + i];
            }
            radius_2 = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 44 + i];
            }
            dz = h.f;

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = seq;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = (uint16_t)(seq) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = tracking;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = armors_num;

			h.f = pos_x;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4 + i] = h.u[i];
            }

			h.f = pos_y;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8 + i] = h.u[i];
            }

			h.f = pos_z;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12 + i] = h.u[i];
            }

			h.f = vel_x;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 16 + i] = h.u[i];
            }

			h.f = vel_y;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 20 + i] = h.u[i];
            }

			h.f = vel_z;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 24 + i] = h.u[i];
            }

			h.f = yaw;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 28 + i] = h.u[i];
            }

			h.f = v_yaw;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 32 + i] = h.u[i];
            }

			h.f = radius_1;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 36 + i] = h.u[i];
            }

			h.f = radius_2;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 40 + i] = h.u[i];
            }

			h.f = dz;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 44 + i] = h.u[i];
            }

        }
    };
}
        