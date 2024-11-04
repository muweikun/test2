
/** @file
 *	@brief Offboardlink comm protocol generated from GimbalConstantAimShootCommand.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct GimbalConstantAimShootCommand : public MessageBase
    {
        public:
        float x;
        float y;
        float z;
        uint8_t freq;
        uint8_t frame;
        helper_float_u32 h;
            
        GimbalConstantAimShootCommand() : MessageBase(0x04, 14)
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

			freq = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12];
        
			frame = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13];
        
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

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12] = freq;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13] = frame;

        }
    };
}
        