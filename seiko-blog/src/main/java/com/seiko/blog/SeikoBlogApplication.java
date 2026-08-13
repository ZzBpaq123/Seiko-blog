package com.seiko.blog;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Seiko Blog 个人博客启动类
 *
 * @author Seiko
 */
@SpringBootApplication
@MapperScan("com.seiko.blog.mapper")
public class SeikoBlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(SeikoBlogApplication.class, args);
    }

}
