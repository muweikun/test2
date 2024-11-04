
/** @file
 *	@brief Offboardlink comm protocol generated from IMUData.json
 *  @author Xianhao Ji
 */

#pragma once
#include "OffboardLink.h"

namespace olk
{
    struct IMUData : public MessageBase
    {
        public:
        uint16_t seq;
        uint32_t stamp;
        int16_t accel[3];
        int16_t gyro[3];
        float w;
        float x;
        float y;
        float z;
        helper_float_u32 h;
            
        IMUData() : MessageBase(0x01, 26)
		{
				
		}

        virtual void decode(uint8_t *buf) override
        {

			seq = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0];

			stamp = ((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4]) << 16 | ((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2]);

			accel[0] = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6];

			accel[1] = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8];

			accel[2] = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 11] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10];

			gyro[0] = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12];

			gyro[1] = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 15] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14];

			gyro[2] = (buf[OFFBOARDLINK_FRAME_HEAD_LEN + 17] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 16];

			w = (int16_t)((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 19] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 18]) / 32760;

			x = (int16_t)((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 21] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 20]) / 32760;

			y = (int16_t)((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 23] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 22]) / 32760;

			z = (int16_t)((buf[OFFBOARDLINK_FRAME_HEAD_LEN + 25] << 8) | buf[OFFBOARDLINK_FRAME_HEAD_LEN + 24]) / 32760;

        }

        virtual void packData(uint8_t *buf) override
        {

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 0] = seq;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 1] = (uint16_t)(seq) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 2] = stamp;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 3] = (uint32_t)(stamp) >> 8;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 4] = (uint32_t)(stamp) >> 16;
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 5] = (uint32_t)(stamp) >> 24;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 6] = accel[0];
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 7] = (int16_t)(accel[0]) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 8] = accel[1];
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 9] = (int16_t)(accel[1]) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 10] = accel[2];
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 11] = (int16_t)(accel[2]) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 12] = gyro[0];
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 13] = (int16_t)(gyro[0]) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 14] = gyro[1];
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 15] = (int16_t)(gyro[1]) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 16] = gyro[2];
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 17] = (int16_t)(gyro[2]) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 18] = (w * 32760);
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 19] = (int16_t)((w * 32760)) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 20] = (x * 32760);
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 21] = (int16_t)((x * 32760)) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 22] = (y * 32760);
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 23] = (int16_t)((y * 32760)) >> 8;

			buf[OFFBOARDLINK_FRAME_HEAD_LEN + 24] = (z * 32760);
            buf[OFFBOARDLINK_FRAME_HEAD_LEN + 25] = (int16_t)((z * 32760)) >> 8;

        }
    };
}
        