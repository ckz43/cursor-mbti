-- MBTI测试系统数据库设计
-- 设计原则：支持完整业务流程、便于数据分析、保证性能

-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(64) UNIQUE NOT NULL COMMENT '用户唯一标识（UUID）',
    openid VARCHAR(64) UNIQUE COMMENT '微信openid',
    unionid VARCHAR(64) COMMENT '微信unionid',
    nickname VARCHAR(100) COMMENT '用户昵称',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    gender TINYINT COMMENT '性别：0-未知，1-男，2-女',
    city VARCHAR(50) COMMENT '城市',
    province VARCHAR(50) COMMENT '省份',
    country VARCHAR(50) COMMENT '国家',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    birth_year SMALLINT COMMENT '出生年份',
    education_level TINYINT COMMENT '教育水平：1-高中及以下，2-大专，3-本科，4-硕士，5-博士',
    occupation VARCHAR(100) COMMENT '职业',
    registration_source VARCHAR(50) DEFAULT 'direct' COMMENT '注册来源：direct-直接访问，share-分享，ad-广告等',
    referrer_user_id VARCHAR(64) COMMENT '推荐人用户ID',
    device_info JSON COMMENT '设备信息',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP COMMENT '最后登录时间',
    
    INDEX idx_openid (openid),
    INDEX idx_unionid (unionid),
    INDEX idx_phone (phone),
    INDEX idx_created_at (created_at),
    INDEX idx_referrer (referrer_user_id)
) COMMENT='用户基础信息表';

-- 测试会话表
CREATE TABLE test_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(64) UNIQUE NOT NULL COMMENT '会话唯一标识',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    test_type VARCHAR(20) DEFAULT 'mbti_93' COMMENT '测试类型：mbti_93等',
    test_version VARCHAR(10) DEFAULT '1.0' COMMENT '测试版本',
    status TINYINT DEFAULT 0 COMMENT '状态：0-进行中，1-已完成，2-已放弃，3-已超时',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    complete_time TIMESTAMP NULL COMMENT '完成时间',
    abandon_time TIMESTAMP NULL COMMENT '放弃时间',
    total_questions INT DEFAULT 93 COMMENT '总题数',
    answered_questions INT DEFAULT 0 COMMENT '已答题数',
    current_question_index INT DEFAULT 0 COMMENT '当前题目索引',
    time_spent_seconds INT DEFAULT 0 COMMENT '总耗时（秒）',
    avg_time_per_question DECIMAL(5,2) COMMENT '平均每题耗时（秒）',
    device_type VARCHAR(20) COMMENT '设备类型：mobile, desktop, tablet',
    browser_info VARCHAR(200) COMMENT '浏览器信息',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    source_page VARCHAR(200) COMMENT '来源页面',
    utm_source VARCHAR(50) COMMENT 'UTM来源',
    utm_medium VARCHAR(50) COMMENT 'UTM媒介',
    utm_campaign VARCHAR(100) COMMENT 'UTM活动',
    
    -- MBTI结果相关字段
    mbti_type CHAR(4) COMMENT 'MBTI类型：如ENFP',
    ei_score DECIMAL(5,2) COMMENT 'E-I维度得分',
    ns_score DECIMAL(5,2) COMMENT 'N-S维度得分',
    tf_score DECIMAL(5,2) COMMENT 'T-F维度得分',
    jp_score DECIMAL(5,2) COMMENT 'J-P维度得分',
    ei_percentage TINYINT COMMENT 'E-I维度百分比',
    ns_percentage TINYINT COMMENT 'N-S维度百分比',
    tf_percentage TINYINT COMMENT 'T-F维度百分比',
    jp_percentage TINYINT COMMENT 'J-P维度百分比',
    confidence_score DECIMAL(3,2) COMMENT '结果置信度',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time),
    INDEX idx_mbti_type (mbti_type),
    INDEX idx_complete_time (complete_time),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) COMMENT='测试会话表';

-- 答题记录表
CREATE TABLE answer_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    question_index INT NOT NULL COMMENT '题目索引（0-92）',
    question_text TEXT COMMENT '题目内容（冗余存储，便于分析）',
    dimension VARCHAR(2) NOT NULL COMMENT '维度：EI, NS, TF, JP',
    direction TINYINT NOT NULL COMMENT '方向：1或-1',
    answer_index TINYINT NOT NULL COMMENT '答案索引：0-3（非常符合到完全不符合）',
    answer_text VARCHAR(20) COMMENT '答案文本',
    answer_score DECIMAL(3,1) COMMENT '答案得分：1.5, 0.5, -0.5, -1.5',
    time_spent_seconds INT COMMENT '答题耗时（秒）',
    is_changed BOOLEAN DEFAULT FALSE COMMENT '是否修改过答案',
    change_count TINYINT DEFAULT 0 COMMENT '修改次数',
    previous_answer_index TINYINT COMMENT '修改前的答案',
    answer_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '答题时间',
    
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_dimension (dimension),
    INDEX idx_question_index (question_index),
    INDEX idx_answer_time (answer_time),
    UNIQUE KEY uk_session_question (session_id, question_index),
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) COMMENT='答题记录表';

-- 支付订单表
CREATE TABLE payment_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(64) UNIQUE NOT NULL COMMENT '订单号',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    session_id VARCHAR(64) COMMENT '关联的测试会话ID',
    product_type VARCHAR(50) NOT NULL COMMENT '产品类型：basic_report, premium_report等',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    original_amount DECIMAL(10,2) NOT NULL COMMENT '原价（分）',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额（分）',
    final_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额（分）',
    currency VARCHAR(3) DEFAULT 'CNY' COMMENT '货币类型',
    payment_method VARCHAR(20) COMMENT '支付方式：wechat, alipay等',
    payment_status TINYINT DEFAULT 0 COMMENT '支付状态：0-待支付，1-已支付，2-已退款，3-支付失败',
    trade_no VARCHAR(100) COMMENT '第三方交易号',
    prepay_id VARCHAR(100) COMMENT '预支付ID',
    payment_time TIMESTAMP NULL COMMENT '支付时间',
    refund_time TIMESTAMP NULL COMMENT '退款时间',
    refund_reason VARCHAR(200) COMMENT '退款原因',
    coupon_code VARCHAR(50) COMMENT '优惠券代码',
    promotion_id VARCHAR(50) COMMENT '促销活动ID',
    ip_address VARCHAR(45) COMMENT '下单IP',
    user_agent TEXT COMMENT '用户代理',
    remark TEXT COMMENT '备注',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_time (payment_time),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id) ON DELETE SET NULL
) COMMENT='支付订单表';

-- 用户行为日志表
CREATE TABLE user_behavior_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    session_id VARCHAR(64) COMMENT '会话ID',
    event_type VARCHAR(50) NOT NULL COMMENT '事件类型：page_view, button_click, test_start, test_complete等',
    event_category VARCHAR(30) COMMENT '事件分类：navigation, test, payment, share等',
    event_action VARCHAR(50) COMMENT '事件动作',
    event_label VARCHAR(100) COMMENT '事件标签',
    page_url VARCHAR(500) COMMENT '页面URL',
    page_title VARCHAR(200) COMMENT '页面标题',
    referrer_url VARCHAR(500) COMMENT '来源URL',
    element_id VARCHAR(100) COMMENT '元素ID',
    element_class VARCHAR(200) COMMENT '元素类名',
    element_text VARCHAR(500) COMMENT '元素文本',
    custom_data JSON COMMENT '自定义数据',
    duration_ms INT COMMENT '持续时间（毫秒）',
    scroll_depth TINYINT COMMENT '滚动深度百分比',
    viewport_width SMALLINT COMMENT '视口宽度',
    viewport_height SMALLINT COMMENT '视口高度',
    device_type VARCHAR(20) COMMENT '设备类型',
    browser_name VARCHAR(50) COMMENT '浏览器名称',
    browser_version VARCHAR(20) COMMENT '浏览器版本',
    os_name VARCHAR(50) COMMENT '操作系统',
    os_version VARCHAR(20) COMMENT '系统版本',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_event_type (event_type),
    INDEX idx_event_category (event_category),
    INDEX idx_created_at (created_at),
    INDEX idx_page_url (page_url(100)),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) COMMENT='用户行为日志表';

-- 分享记录表
CREATE TABLE share_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    share_id VARCHAR(64) UNIQUE NOT NULL COMMENT '分享唯一标识',
    user_id VARCHAR(64) NOT NULL COMMENT '分享者用户ID',
    session_id VARCHAR(64) COMMENT '关联的测试会话ID',
    share_type VARCHAR(20) NOT NULL COMMENT '分享类型：result, invitation等',
    share_platform VARCHAR(20) COMMENT '分享平台：wechat, weibo, qq等',
    share_content JSON COMMENT '分享内容',
    share_url VARCHAR(500) COMMENT '分享链接',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    conversion_count INT DEFAULT 0 COMMENT '转化次数',
    last_viewed_at TIMESTAMP COMMENT '最后查看时间',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_share_type (share_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id) ON DELETE SET NULL
) COMMENT='分享记录表';

-- 数据分析视图

-- 用户转化漏斗视图
CREATE VIEW user_conversion_funnel AS
SELECT 
    DATE(u.created_at) as date,
    COUNT(DISTINCT u.user_id) as registered_users,
    COUNT(DISTINCT ts.user_id) as test_started_users,
    COUNT(DISTINCT CASE WHEN ts.status = 1 THEN ts.user_id END) as test_completed_users,
    COUNT(DISTINCT po.user_id) as paid_users,
    COUNT(DISTINCT sr.user_id) as shared_users
FROM users u
LEFT JOIN test_sessions ts ON u.user_id = ts.user_id
LEFT JOIN payment_orders po ON u.user_id = po.user_id AND po.payment_status = 1
LEFT JOIN share_records sr ON u.user_id = sr.user_id
GROUP BY DATE(u.created_at);

-- MBTI类型分布视图
CREATE VIEW mbti_type_distribution AS
SELECT 
    mbti_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM test_sessions WHERE status = 1), 2) as percentage,
    AVG(time_spent_seconds) as avg_time_spent,
    AVG(CASE WHEN po.payment_status = 1 THEN 1 ELSE 0 END) as payment_rate
FROM test_sessions ts
LEFT JOIN payment_orders po ON ts.session_id = po.session_id
WHERE ts.status = 1 AND ts.mbti_type IS NOT NULL
GROUP BY mbti_type
ORDER BY count DESC;

-- 创建索引优化查询性能
CREATE INDEX idx_users_created_date ON users(DATE(created_at));
CREATE INDEX idx_sessions_complete_date ON test_sessions(DATE(complete_time));
CREATE INDEX idx_orders_payment_date ON payment_orders(DATE(payment_time));
CREATE INDEX idx_behaviors_event_date ON user_behavior_logs(DATE(created_at));

-- 插入初始化数据
INSERT INTO users (user_id, nickname, registration_source) VALUES 
('system', '系统用户', 'system');

-- 创建数据分析相关的存储过程
DELIMITER //

-- 计算用户留存率
CREATE PROCEDURE CalculateRetentionRate(
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        DATE(created_at) as cohort_date,
        COUNT(DISTINCT user_id) as new_users,
        COUNT(DISTINCT CASE WHEN DATEDIFF(last_login_at, created_at) >= 1 THEN user_id END) as day1_retained,
        COUNT(DISTINCT CASE WHEN DATEDIFF(last_login_at, created_at) >= 7 THEN user_id END) as day7_retained,
        COUNT(DISTINCT CASE WHEN DATEDIFF(last_login_at, created_at) >= 30 THEN user_id END) as day30_retained,
        ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF(last_login_at, created_at) >= 1 THEN user_id END) * 100.0 / COUNT(DISTINCT user_id), 2) as day1_retention_rate,
        ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF(last_login_at, created_at) >= 7 THEN user_id END) * 100.0 / COUNT(DISTINCT user_id), 2) as day7_retention_rate,
        ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF(last_login_at, created_at) >= 30 THEN user_id END) * 100.0 / COUNT(DISTINCT user_id), 2) as day30_retention_rate
    FROM users 
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
    ORDER BY cohort_date;
END //

DELIMITER ;

-- 创建触发器自动更新统计信息
DELIMITER //

CREATE TRIGGER update_session_progress 
AFTER INSERT ON answer_records
FOR EACH ROW
BEGIN
    UPDATE test_sessions 
    SET 
        answered_questions = answered_questions + 1,
        current_question_index = NEW.question_index + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = NEW.session_id;
END //

DELIMITER ;

COMMIT;