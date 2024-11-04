
/** @file
 *	@brief Offboardlink comm protocol generated from DecisionDaemon.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct DecisionDaemon : public MessageBase
    {
        public:
        uint8_t behaviour;
        
        DecisionDaemon() : MessageBase(0x61, 1)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			behaviour = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];
        
        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = behaviour;

        }
    };
}
        