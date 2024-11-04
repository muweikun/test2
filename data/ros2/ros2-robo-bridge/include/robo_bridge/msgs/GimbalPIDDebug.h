
/** @file
 *	@brief Offboardlink comm protocol generated from GimbalPIDDebug.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct GimbalPIDDebug : public MessageBase
    {
        public:
        uint16_t seq;
        uint32_t stamp;
        float pitch_exp;
        float pitch_imu;
        float yaw_exp;
        float yaw_imu;
        float x;
        float y;
        float z;
        helper_float_u32 h;
            
        GimbalPIDDebug() : MessageBase(0xa0, 34)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			seq = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];

			stamp = ((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4]) << 16 | ((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2]);

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6 + i];
            }
            pitch_exp = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10 + i];
            }
            pitch_imu = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14 + i];
            }
            yaw_exp = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 18 + i];
            }
            yaw_imu = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 22 + i];
            }
            x = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 26 + i];
            }
            y = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 30 + i];
            }
            z = h.f;

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = seq;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = (uint16_t)(seq) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = stamp;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = (uint32_t)(stamp) >> 8;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = (uint32_t)(stamp) >> 16;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] = (uint32_t)(stamp) >> 24;

			h.f = pitch_exp;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6 + i] = h.u[i];
            }

			h.f = pitch_imu;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10 + i] = h.u[i];
            }

			h.f = yaw_exp;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14 + i] = h.u[i];
            }

			h.f = yaw_imu;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 18 + i] = h.u[i];
            }

			h.f = x;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 22 + i] = h.u[i];
            }

			h.f = y;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 26 + i] = h.u[i];
            }

			h.f = z;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 30 + i] = h.u[i];
            }

        }
    };
}
        