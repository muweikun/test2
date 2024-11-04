
/** @file
 *	@brief Offboardlink comm protocol generated from ChassisStrategy.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct ChassisStrategy : public MessageBase
    {
        public:
        uint8_t ready_shoot;
        
        ChassisStrategy() : MessageBase(0xa2, 1)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			ready_shoot = buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];
        
        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = ready_shoot;

        }
    };
}
        