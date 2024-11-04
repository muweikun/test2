/*****************************************************************
**                大连理工大学 凌BUG战队
**    没有什么难题是一个通宵解决不了的，如果有那就整两个！
**---------------------------------------------------------------
** 项目名称：   mxdemo_std_robot
** 日    期：   2021-04-15
** 作    者：   
**---------------------------------------------------------------
** 文 件 名：   referee_system.h
** 文件说明：   裁判系统协议解析和客户端UI绘制
*****************************************************************/
#ifndef REFEREE_SYSTEM_H
#define REFEREE_SYSTEM_H


/*---------------------INCLUDES----------------------*/
#include "main.h"

#include <stdio.h>
#include <stdarg.h>


/*---------------------DEFINES-----------------------*/
#define REFEREE_FIFO_BUF_NUM				8
#define REFEREE_FIFO_BUF_LEN 				1024

//红方机器人ID与客户端ID
#define RED_HERO_1_ROBOT					1
#define RED_ENGINEER_2_ROBOT				2
#define RED_INFANTRY_3_ROBOT				3
#define RED_INFANTRY_4_ROBOT				4
#define RED_INFANTRY_5_ROBOT				5
#define RED_AERIAL_6_ROBOT					6
#define RED_SENTRY_7_ROBOT					7
#define RED_DARTLAUNCH_8				   8
#define RED_RADAR_9							9

#define RED_HERO_1_CLIENT					0x0101		//257
#define RED_ENGINEER_2_CLIENT				0x0102		//258
#define RED_INFANTRY_3_CLIENT				0x0103		//259
#define RED_INFANTRY_4_CLIENT				0x0104		//260
#define RED_INFANTRY_5_CLIENT				0x0105		//261
#define RED_AERIAL_6_CLIENT				0x0106		//262

//蓝方机器人ID和客户端ID

#define BLUE_HERO_1_ROBOT					101
#define BLUE_ENGINEER_2_ROBOT				102
#define BLUE_INFANTRY_3_ROBOT				103
#define BLUE_INFANTRY_4_ROBOT				104
#define BLUE_INFANTRY_5_ROBOT				105
#define BLUE_AERIAL_6_ROBOT				106
#define BLUE_SENTRY_7_ROBOT				107
#define BLUE_DARTLAUNCH_8					108
#define BLUE_RADAR_9							109

#define BLUE_HERO_1_CLIENT					0x0165		//357
#define BLUE_ENGINEER_2_CLIENT			0x0166		//358
#define BLUE_INFANTRY_3_CLIENT			0x0167		//359
#define BLUE_INFANTRY_4_CLIENT			0x0168		//360
#define BLUE_INFANTRY_5_CLIENT			0x0169		//361
#define BLUE_AERIAL_6_CLIENT				0x016A		//362

//CLIENT UI
#define UI_OPERATE_ADD							1
#define UI_OPERATE_UPDATE						2

#define UI_COLOR_RED_BLUE						0
#define UI_COLOR_YELLOW							1
#define UI_COLOR_GREEN							2
#define UI_COLOR_ORANGE							3
#define UI_COLOR_VIOLETRED					   4
#define UI_COLOR_PINK							5
#define UI_COLOR_BLUEGREEN					   6
#define UI_COLOR_BLACK							7
#define UI_COLOR_WHITE							8




/*---------------------STRUCTS-----------------------*/
//帧头
typedef __packed struct
{
	uint8_t  sof;                       //数据帧起始字节，固定值为 0xA5
	uint16_t data_length;               //数据帧中 data 的长度
	uint8_t  seq;                       //包序号
	uint8_t  crc8;                      //帧头 CRC8 校验
} frame_header_t;

//0x0001,1Hz,比赛状态数据
typedef __packed struct
{ 
	uint32_t recv_cnt;                  //接收计数
	uint8_t game_type:4;                //比赛类型：1：RoboMaster 机甲大师赛2：RoboMaster 机甲大师单项赛3：ICRA RoboMaster 人工智能挑战赛4：RoboMaster 联盟赛 3V3.5：RoboMaster 联盟赛 1V1
	uint8_t game_progress:4;            //比赛阶段:0：未开始比赛；1：准备阶段；2：自检阶段；3：5s 倒计时； 4：对战中；5：比赛结算中
	uint16_t stage_remain_time;         //当前阶段剩余时间，单位 s 
	uint64_t SyncTimeStamp;             //Unix时间戳时间戳(unix timestamp)是从1970年到现在的秒数，当机载端收到有效的 NTP 服务器授时后生效

} ext_game_status_t;

//0x0002,比赛结束后发送,比赛结果数据
typedef __packed struct
{ 
	uint32_t recv_cnt;                  //接收计数
	uint8_t winner;                     //接收计数
} ext_game_result_t;

//0x0003,1Hz,比赛机器人血量数据        //有改动
typedef __packed struct
{ 
	uint32_t recv_cnt;
	uint16_t red_1_robot_HP; 
	uint16_t red_2_robot_HP; 
	uint16_t red_3_robot_HP; 
	uint16_t red_4_robot_HP; 
	uint16_t red_5_robot_HP;
	uint16_t red_7_robot_HP; 
	uint16_t red_outpost_HP; 
	uint16_t red_base_HP; 
	uint16_t blue_1_robot_HP; 
	uint16_t blue_2_robot_HP; 
	uint16_t blue_3_robot_HP; 
	uint16_t blue_4_robot_HP; 
	uint16_t blue_5_robot_HP; 
	uint16_t blue_7_robot_HP; 
	uint16_t blue_outpost_HP; 
	uint16_t blue_base_HP; 
} ext_game_robot_HP_t;

//0x0101,事件改变后发送,场地事件数据
typedef __packed struct
{
	uint32_t recv_cnt;
	uint32_t event_type;     //事件类型
	
} ext_event_data_t;

//0x0102,动作改变后发送,场地补给站动作标识数据
typedef __packed struct
{
	uint32_t recv_cnt;
	uint8_t supply_projectile_id;    //补给站ID
	uint8_t supply_robot_id;         //补弹机器人ID
	uint8_t supply_projectile_step;  //出弹口开闭状态
	uint8_t supply_projectile_num;   //补弹数量(50,100,150,200)
} ext_supply_projectile_action_t;

//0x0104,警告发生后发送,裁判警告信息
typedef __packed struct
{ 
	uint32_t recv_cnt;
	uint8_t level;                    //警告等级：黄，红，判负
	uint8_t foul_robot_id;            //犯规机器人ID
} ext_referee_warning_t;

//0x0105,飞镖发射口开启倒计时
typedef __packed struct
{
	uint32_t recv_cnt;
   uint8_t dart_remaining_time;      //十五秒倒计时
} ext_dart_remaining_time_t;


//0x0201,10Hz,机器人状态数据
typedef __packed struct
{ 
	uint32_t recv_cnt;                
	uint8_t robot_id;                 
	uint8_t robot_level; 
	uint16_t remain_HP; 
	uint16_t max_HP; 
	
	uint16_t shooter_id1_42mm_cooling_rate;  //每秒冷却值
	uint16_t shooter_id1_42mm_cooling_limit; //枪口热量上限
	uint16_t shooter_id1_42mm_speed_limit;   //枪口上限速度

	uint16_t shooter_id1_17mm_cooling_rate;
   uint16_t shooter_id1_17mm_cooling_limit;
   uint16_t shooter_id1_17mm_speed_limit;

	uint16_t shooter_id2_17mm_cooling_rate;
   uint16_t shooter_id2_17mm_cooling_limit;
   uint16_t shooter_id2_17mm_speed_limit;
	
	uint16_t chassis_power_limit;            //机器人底盘功率限制上限
	
	uint8_t mains_power_gimbal_output:1;     //主控电源输出情况：0无输出，1有输出
	uint8_t mains_power_chassis_output:1; 
	uint8_t mains_power_shooter_output:1; 
} ext_game_robot_status_t;

//0x0202,50Hz,实时功率热量数据
typedef __packed struct
{ 
	uint32_t recv_cnt;
	uint16_t chassis_volt; //底盘输出电压 单位 毫伏
	uint16_t chassis_current;  //底盘输出电流 单位 毫安
	float chassis_power;       //底盘输出功率 单位 W 瓦
	uint16_t chassis_power_buffer;   //底盘功率缓冲 单位 J 焦耳 备注：飞坡根据规则增加至 250J
	uint16_t shooter_id1_17mm_cooling_heat;  //枪口热量
   uint16_t shooter_id2_17mm_cooling_heat;
   uint16_t shooter_id1_42mm_cooling_heat;

} ext_power_heat_data_t;

//0x0203,10Hz,机器人位置数据
typedef __packed struct
{ 
	uint32_t recv_cnt;
	float x; 
	float y; 
	float z; 
	float yaw;   //位置枪口，单位度
} ext_game_robot_pos_t;

//0x0204,增益状态改变后发送,机器人增益数据
typedef __packed struct
{ 
	uint32_t recv_cnt;
	uint8_t power_rune_buff; //可攻击时间 30s 递减至 0s
} ext_buff_t;

//0x0206,伤害发生后发送,伤害状态数据
typedef __packed struct
{ 
	uint32_t recv_cnt;
	uint8_t  armor_id:4; 
	uint8_t  hurt_type:4; 
} ext_robot_hurt_t;

//0x0207,子弹发射后发送,实时射击数据
typedef __packed struct
{ 
	uint32_t recv_cnt,recv_cnt_last;
	uint8_t bullet_type;
	uint8_t shooter_id;
	uint8_t bullet_freq; 
	float bullet_speed; 
	float bullet_speed_last;
} ext_shoot_data_t;

//0x0208,1Hz,子弹剩余发射数
typedef __packed struct
{ 
	uint32_t recv_cnt;
	uint16_t bullet_remaining_num_17mm;
	uint16_t bullet_remaining_num_42mm;
	uint16_t coin_remaining_num;
} ext_bullet_remaining_t;

//0x0209,1Hz,机器人RFID状态数据
typedef __packed struct
{ 
	uint32_t recv_cnt;
	uint32_t rfid_status;
} ext_rfid_status_t;

//0x020A,10Hz,飞镖机器人客户端指令数据
typedef __packed struct
{
 uint32_t recv_cnt;                   
 uint8_t dart_launch_opening_status;  //飞镖状态
 uint8_t dart_attack_target;          //打击目标
 uint16_t target_change_time;         //切换打击目标时的比赛剩余时间，单位秒，从未切换默认为 0
 uint16_t operate_launch_cmd_time;    //最近一次操作手确定发射指令时的比赛剩余时间，单位秒, 初始值为 0
} ext_dart_client_cmd_t;

//机器人裁判系统获取总状态数据
typedef __packed struct
{
	ext_game_status_t game_status; //0x0001
	ext_game_result_t game_result; //0x0002
	ext_game_robot_HP_t game_robot_HP; //0x0003
	
	ext_event_data_t event_data; //0x0101
	ext_supply_projectile_action_t supply_projectile_action; //0x0102
	ext_referee_warning_t referee_warning; //0x0104
	ext_dart_remaining_time_t dart_remaining_time; //0x0105
	ext_game_robot_status_t game_robot_status; //0x0201
	ext_power_heat_data_t power_heat_data; //0x0202
	ext_game_robot_pos_t game_robot_pos; //0x0203
	ext_buff_t buff; //0x0204

	ext_robot_hurt_t robot_hurt; //0x0206
	ext_shoot_data_t shoot_data; //0x0207
	ext_bullet_remaining_t bullet_remaining; //0x0208
	ext_rfid_status_t rfid_status; //0x0209
   ext_dart_client_cmd_t dart_client_cmd; //0x020A
	
	uint32_t cmd_error_count[6]; //0-seq_num error; 1-frame_header & length error; 2-head_crc8 error; 3-package length error; 4-package_crc16 error; 5-cmd error
	
} RobotRefereeStatus_t;

typedef __packed  struct
{
	int16_t x;
	int16_t y;
	uint8_t yaw;
	uint8_t rubbish_class;
	uint8_t flag;

} target;



//0x0301,发送方机器人触发，机器人间交互数据   
typedef __packed struct
{
	uint16_t data_cmd_id;
	uint16_t sender_ID;
	uint16_t receiver_ID;
} ext_student_interactive_header_data_t;


//0x0301,删除图形
typedef __packed struct
{
	uint8_t operate_type;
	uint8_t layer;
} ext_client_custom_graphic_delete_t;


//0x0301,图形数据
typedef __packed struct
{
	uint8_t graphic_name[3];
	uint32_t operate_tpye:3;
	uint32_t graphic_tpye:3;
	uint32_t layer:4;
	uint32_t color:4;
	uint32_t start_angle:9;
	uint32_t end_angle:9;
	uint32_t width:10;
	uint32_t start_x:11;
	uint32_t start_y:11;
	__packed union{
		__packed struct{
			uint32_t radius:10;
			uint32_t end_x:11;
			uint32_t end_y:11;
		} value;
		float float_value;
		int32_t int32_value;
	} graphic_config_3;
} graphic_data_struct_t;

//0x0301,绘制字符
typedef __packed struct
{
	graphic_data_struct_t grapic_data_struct;
	uint8_t data[30];
} ext_client_custom_character_t;

//0x0302,自定义控制器交互数据
typedef __packed struct
{
   uint8_t dart_condition[1];
} robot_interactive_data_t;

//0x0303,小地图下发信息标识
typedef __packed struct
{
    float target_position_x;
    float target_position_y;
    float target_position_z;
    uint8_t commd_keyboard;
    uint16_t target_robot_ID;
} ext_robot_command_t;

//客户端UI绘制所需数据
typedef __packed struct
{

	
	uint8_t robot_id;
	uint8_t max_chassis_power; //底盘功率上限
	uint8_t shoot_speed_limit; //枪口射速上限
	uint8_t shoot_heat_limit;  //枪口热量上限
	uint8_t shoot_cooling_rate; //枪口热量每秒冷却值
	float battery_voltage;     //电池电压
	float bmi088_temperature;  //bmi088芯片温度
	float chip_temperature;    //stm32f407芯片温度
	
	uint8_t motor_temperature[9]; //电机温度
	

	uint16_t ui_refresh_fps,laser_refresh_fps;
	//
	uint8_t movement_mode,top_flag ;//运动模式
	                                //实时弹道解算
	float L1_Gimbal_angel, L1_Gimbal_angel_delta;
	uint8_t RTTS_Gimbal, RTTS_Follow;
	
	uint8_t chassis_tip_clock; //底盘旋转0顺1逆
	uint8_t chassis_accelerate_mode; //底盘加速模式
	uint8_t gimbal_autoaiming_control_mode; //云台自瞄控制模式
	uint8_t block_handel; //退弹
	
	uint8_t self_check_state; //自检状态
	
	
	float pitch_angle; //云台pitch角度
	float yaw_delt_angle; //云台yaw偏差角度
	
	float supercap_voltage; //超级电容电压
	float supercap_energy_percent; //超级电容能量百分比
	
	float chassis_move_speed; //底盘移动速度
	float gyro_rotate_speed; //小陀螺旋转速度
	float shoot_motor_speed[2]; //摩擦轮电机转速 rpm
	float turnbullet_frequency; //拨弹射率 hz
	
	int auto_aiming_num; //自瞄识别数字
	float auto_aiming_stability; //自瞄识别稳定度 0.0-1.0
	
} ClientUIStatus_t;

//测试用——结构体
typedef __packed struct
{
	frame_header_t txframe_haeder;//帧头
	uint16_t cmd_id;             //命令码
	ext_student_interactive_header_data_t client_custom_id;//数据段头结构
	graphic_data_struct_t Graphic_Data[7];  //数据段
	uint16_t CRC16;                //帧尾
	
}
ext_draw_test_t;





/*---------------------DECLARES----------------------*/


extern RobotRefereeStatus_t robot_referee_status;
extern ClientUIStatus_t client_ui_status;


//
void PushToRefereeFIFOBuf(uint8_t *pdata, uint16_t max_size, uint16_t start_pos, uint16_t end_pos);
void ParseRefereeSystemData(void);

//
uint8_t Get_CRC8_Check_Sum(uint8_t *pchMessage, uint32_t dwLength, uint8_t ucCRC8);
uint32_t Verify_CRC8_Check_Sum(uint8_t *pchMessage, uint32_t dwLength);
void Append_CRC8_Check_Sum(uint8_t *pchMessage, uint32_t dwLength);

uint16_t Get_CRC16_Check_Sum(uint8_t *pchMessage, uint32_t dwLength, uint16_t wCRC);
uint32_t Verify_CRC16_Check_Sum(uint8_t *pchMessage, uint32_t dwLength);
void Append_CRC16_Check_Sum(uint8_t *pchMessage, uint32_t dwLength);

//
//void create_robot_interactive_package(uint8_t* tx_buf, uint8_t tx_buf_len, uint16_t data_cmd_id, uint16_t receiver_robot_id);
void create_ui_interactive_package(uint8_t* tx_buf, uint8_t tx_buf_len, uint16_t data_cmd_id);

void set_clear_graphics_data(uint8_t* tx_buf, uint8_t operate, uint8_t layer);
void set_line_graphics_data(uint8_t* tx_buf,uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t end_x, uint16_t end_y);
void set_rectangle_graphics_data(uint8_t* tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t opposite_x, uint16_t opposite_y);
void set_circle_graphics_data(uint8_t* tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t center_x, uint16_t center_y, uint16_t radius);
void set_ellipse_graphics_data(uint8_t* tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t center_x, uint16_t center_y, uint16_t half_axis_x, uint16_t half_axis_y);
void set_arc_graphics_data(uint8_t* tx_buf, uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_angle, uint16_t end_angle, uint16_t center_x, uint16_t center_y, uint16_t half_axis_x, uint16_t half_axis_y);
//void set_float_graphics_data(uint8_t* tx_buf, char *name, uint8_t operate, uint8_t size, uint8_t color, uint16_t start_x, uint16_t start_y, float value);
//void set_integer_graphics_data(uint8_t* tx_buf, char *name, uint8_t operate, uint8_t size, uint8_t color, uint16_t start_x, uint16_t start_y, int32_t value);

//
void ClientUI_ClearLayer(uint8_t layer);
void ClientUI_DrawLine(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t end_x, uint16_t end_y);
void ClientUI_DrawRectangle(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t opposite_x, uint16_t opposite_y);
void ClientUI_DrawCircle(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t center_x, uint16_t center_y, uint16_t radius);
void ClientUI_DrawEllipse(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t center_x, uint16_t center_y, uint16_t half_axis_x, uint16_t half_axis_y);
void ClientUI_DrawArc(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_angle, uint16_t end_angle, uint16_t center_x, uint16_t center_y, uint16_t half_axis_x, uint16_t half_axis_y);
//void ClientUI_DrawFloat(char *name, uint8_t operate, uint8_t size, uint8_t color, uint16_t start_x, uint16_t start_y, float value);
//void ClientUI_DrawInteger(char *name, uint8_t operate, uint8_t size, uint8_t color, uint16_t start_x, uint16_t start_y, int32_t value);
void ClientUI_DrawString(uint8_t layer, char *name, uint8_t operate, uint8_t size, uint8_t color, uint16_t start_x, uint16_t start_y, const char *str, ...);
/*
void ClientUI_Update7Graphcis_1(void);
void ClientUI_Update7Graphcis_2(void);
void ClientUI_Update7Graphcis_3(void);

//
*/
//extern void RefreshDynamicClientUI(int8_t *ui_show_detail_flag);
void RefreshDynamicClientUI(int8_t ui_show_detail_flag);
extern void ClientUI_Update7Graphcis_3(void);
extern void ClientUI_Update7Graphcis_5(void);;
void UI_layer_0_CQB_static(void);
void UI_layer_1_GLAZ_static(void);
void ClientUI_Update7Graphcis_one(void);
void RefreshStaticClientUI(void);

void Angle_to_Pixel(float angle,uint16_t* pixel);

//测试用
void Draw_test(ext_draw_test_t *draw,uint16_t cmd_id,uint16_t data_id,uint16_t tx_id,uint16_t rx_id);
void Draw_test2(uint8_t *tx_buf, uint8_t tx_buf_len, uint16_t data_cmd_id);
void ClientUI_DrawLine_test(uint8_t layer, char *name, uint8_t operate, uint16_t width, uint8_t color, uint16_t start_x, uint16_t start_y, uint16_t end_x, uint16_t end_y);
#endif
