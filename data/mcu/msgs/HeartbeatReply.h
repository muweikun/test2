
/** @file
 *	@brief Offboardlink comm protocol generated from HeartbeatReply.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct HeartbeatReply : public MessageBase
    {
        public:
        uint8_t from_device;
        uint8_t to_device;
        
        HeartbeatReply() : MessageBase(0x52, 2)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			from_device = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];
        
			to_device = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1];
        
        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = from_device;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = to_device;

        }
    };
}
        