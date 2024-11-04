
/** @file
 *	@brief Offboardlink comm protocol generated from MinipcHeartbeat.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct MinipcHeartbeat : public MessageBase
    {
        public:
        uint8_t current_target;
        uint8_t detect_num;
        uint8_t aim_mode;
        
        MinipcHeartbeat() : MessageBase(0x50, 3)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			current_target = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];
        
			detect_num = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1];
        
			aim_mode = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2];
        
        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = current_target;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = detect_num;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = aim_mode;

        }
    };
}
        