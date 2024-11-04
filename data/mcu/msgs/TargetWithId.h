
/** @file
 *	@brief Offboardlink comm protocol generated from TargetWithId.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct TargetWithId : public MessageBase
    {
        public:
        uint16_t seq;
        uint8_t id;
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
            
        TargetWithId() : MessageBase(0xbd, 49)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			seq = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];

			id = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2];
        
			tracking = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3];
        
			armors_num = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4];
        
			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5 + i];
            }
            pos_x = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9 + i];
            }
            pos_y = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13 + i];
            }
            pos_z = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 17 + i];
            }
            vel_x = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 21 + i];
            }
            vel_y = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 25 + i];
            }
            vel_z = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 29 + i];
            }
            yaw = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 33 + i];
            }
            v_yaw = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 37 + i];
            }
            radius_1 = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 41 + i];
            }
            radius_2 = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 45 + i];
            }
            dz = h.f;

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = seq;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = (uint16_t)(seq) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = id;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = tracking;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = armors_num;

			h.f = pos_x;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5 + i] = h.u[i];
            }

			h.f = pos_y;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9 + i] = h.u[i];
            }

			h.f = pos_z;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13 + i] = h.u[i];
            }

			h.f = vel_x;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 17 + i] = h.u[i];
            }

			h.f = vel_y;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 21 + i] = h.u[i];
            }

			h.f = vel_z;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 25 + i] = h.u[i];
            }

			h.f = yaw;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 29 + i] = h.u[i];
            }

			h.f = v_yaw;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 33 + i] = h.u[i];
            }

			h.f = radius_1;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 37 + i] = h.u[i];
            }

			h.f = radius_2;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 41 + i] = h.u[i];
            }

			h.f = dz;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 45 + i] = h.u[i];
            }

        }
    };
}
        