
/** @file
 *	@brief Offboardlink comm protocol generated from AutoAimInfo.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct AutoAimInfo : public MessageBase
    {
        public:
        uint8_t self_color;
        uint8_t hero_score;
        uint8_t infantry3_score;
        uint8_t infantry4_score;
        uint8_t sentry_score;
        uint8_t base_score;
        uint8_t who_is_balance;
        uint16_t exposure;
        
        AutoAimInfo() : MessageBase(0xbc, 9)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			self_color = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];
        
			hero_score = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1];
        
			infantry3_score = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2];
        
			infantry4_score = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3];
        
			sentry_score = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4];
        
			base_score = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5];
        
			who_is_balance = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6];
        
			exposure = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7];

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = self_color;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = hero_score;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = infantry3_score;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = infantry4_score;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = sentry_score;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] = base_score;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6] = who_is_balance;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7] = exposure;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8] = (uint16_t)(exposure) >> 8;

        }
    };
}
        