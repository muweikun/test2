
/** @file
 *	@brief Offboardlink comm protocol generated from ShootDebug.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct ShootDebug : public MessageBase
    {
        public:
        uint16_t seq;
        uint32_t stamp;
        float shoot_flag;
        helper_float_u32 h;
            
        ShootDebug() : MessageBase(0xba, 10)
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
            shoot_flag = h.f;

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = seq;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = (uint16_t)(seq) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = stamp;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = (uint32_t)(stamp) >> 8;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = (uint32_t)(stamp) >> 16;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] = (uint32_t)(stamp) >> 24;

			h.f = shoot_flag;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6 + i] = h.u[i];
            }

        }
    };
}
        