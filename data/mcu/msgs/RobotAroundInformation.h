
/** @file
 *	@brief Offboardlink comm protocol generated from RobotAroundInformation.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct RobotAroundInformation : public MessageBase
    {
        public:
        uint8_t robot_id;
        uint8_t is_top;
        uint8_t armor_cnt_in_sight;
        uint16_t remain_HP;
        
        RobotAroundInformation() : MessageBase(0x41, 5)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			robot_id = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];
        
			is_top = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1];
        
			armor_cnt_in_sight = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2];
        
			remain_HP = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3];

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = robot_id;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = is_top;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = armor_cnt_in_sight;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = remain_HP;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = (uint16_t)(remain_HP) >> 8;

        }
    };
}
        