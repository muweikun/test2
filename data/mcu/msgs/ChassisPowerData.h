
/** @file
 *	@brief Offboardlink comm protocol generated from ChassisPowerData.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct ChassisPowerData : public MessageBase
    {
        public:
        uint16_t seq;
        uint32_t stamp;
        float chassis_voltage;
        float chassis_current;
        float chassis_power;
        float supercap_voltage;
        float supercap_percent;
        helper_float_u32 h;
            
        ChassisPowerData() : MessageBase(0x44, 26)
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
            chassis_voltage = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10 + i];
            }
            chassis_current = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14 + i];
            }
            chassis_power = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 18 + i];
            }
            supercap_voltage = h.f;

			for(uint8_t i = 0; i < 4; i ++)
            {
                h.u[i] = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 22 + i];
            }
            supercap_percent = h.f;

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = seq;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = (uint16_t)(seq) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = stamp;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = (uint32_t)(stamp) >> 8;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = (uint32_t)(stamp) >> 16;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] = (uint32_t)(stamp) >> 24;

			h.f = chassis_voltage;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6 + i] = h.u[i];
            }

			h.f = chassis_current;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10 + i] = h.u[i];
            }

			h.f = chassis_power;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14 + i] = h.u[i];
            }

			h.f = supercap_voltage;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 18 + i] = h.u[i];
            }

			h.f = supercap_percent;
            for(uint8_t i = 0; i < 4; i ++)
            {
                buf[OFFBOARDLINK_FRAME_HEAD_LEN + 22 + i] = h.u[i];
            }

        }
    };
}
        