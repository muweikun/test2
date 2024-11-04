
/** @file
 *	@brief Offboardlink comm protocol generated from ChassisVelYawRateCommand.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct ChassisVelYawRateCommand : public MessageBase
    {
        public:
        float x;
        float y;
        float z;
        float yaw_rate;
        uint8_t frame;
        helper_float_u32 h;
            
        ChassisVelYawRateCommand() : MessageBase(0x02, 17)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0 + i];
            }
            x = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4 + i];
            }
            y = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8 + i];
            }
            z = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12 + i];
            }
            yaw_rate = h.f;

			frame = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 16];
        
        }

        virtual void packData(uint8_t *buf) override
        {

			h.f = x;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0 + i] = h.u[i];
            }

			h.f = y;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4 + i] = h.u[i];
            }

			h.f = z;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8 + i] = h.u[i];
            }

			h.f = yaw_rate;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12 + i] = h.u[i];
            }

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 16] = frame;

        }
    };
}
        