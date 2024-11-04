
/** @file
 *	@brief Offboardlink comm protocol generated from ReferenceDataSuper.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct ReferenceDataSuper : public MessageBase
    {
        public:
        uint8_t game_state;
        uint16_t remaining_time;
        uint8_t self_color;
        uint16_t self_health;
        float enermy_outpost_hp;
        float my_outpost_hp;
        float enermy_base_hp;
        float my_base_hp;
        float enermy_sentry_hp;
        uint16_t shoot_heat;
        uint16_t remaining_bullet;
        uint8_t who_is_balance;
        helper_float_u32 h;
            
        ReferenceDataSuper() : MessageBase(0x42, 16)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			game_state = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];
        
			remaining_time = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1];

			self_color = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3];
        
			self_health = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4];

			enermy_outpost_hp = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6]) / 214;
        
			my_outpost_hp = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7]) / 214;
        
			enermy_base_hp = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8]) / 160;
        
			my_base_hp = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9]) / 160;
        
			enermy_sentry_hp = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10]) / 130;
        
			shoot_heat = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 11];

			remaining_bullet = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13];

			who_is_balance = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 15];
        
        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = game_state;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = remaining_time;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = (uint16_t)(remaining_time) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = self_color;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = self_health;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] = (uint16_t)(self_health) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6] = (enermy_outpost_hp * 214);

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7] = (my_outpost_hp * 214);

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8] = (enermy_base_hp * 160);

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9] = (my_base_hp * 160);

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10] = (enermy_sentry_hp * 130);

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 11] = shoot_heat;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12] = (uint16_t)(shoot_heat) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13] = remaining_bullet;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14] = (uint16_t)(remaining_bullet) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 15] = who_is_balance;

        }
    };
}
        