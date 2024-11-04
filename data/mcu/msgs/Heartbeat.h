
/** @file
 *	@brief Offboardlink comm protocol generated from Heartbeat.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct Heartbeat : public MessageBase
    {
        public:
        uint16_t seq;
        uint32_t stamp;
        uint8_t from_device;
        uint8_t to_device;
        float usage;
        helper_float_u32 h;
            
        Heartbeat() : MessageBase(0x51, 10)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			seq = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];

			stamp = ((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4]) << 16 | ((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2]);

			from_device = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6];
        
			to_device = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7];
        
			usage = (uint16_t)((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8]) / 65535;

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = seq;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = (uint16_t)(seq) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = stamp;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = (uint32_t)(stamp) >> 8;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = (uint32_t)(stamp) >> 16;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] = (uint32_t)(stamp) >> 24;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6] = from_device;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7] = to_device;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8] = (usage * 65535);
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9] = (uint16_t)((usage * 65535)) >> 8;

        }
    };
}
        