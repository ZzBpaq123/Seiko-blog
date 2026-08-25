package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.seiko.blog.entity.Post;
import com.seiko.blog.mapper.AlbumMapper;
import com.seiko.blog.mapper.CommentMapper;
import com.seiko.blog.mapper.LogMapper;
import com.seiko.blog.mapper.PhotoMapper;
import com.seiko.blog.mapper.PostMapper;
import com.seiko.blog.service.StatsService;
import com.seiko.blog.vo.CreationTrendVO;
import com.seiko.blog.vo.DateCountVO;
import com.seiko.blog.vo.ReadTrendVO;
import com.seiko.blog.vo.StatsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 数据统计服务实现
 */
@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final PostMapper postMapper;
    private final CommentMapper commentMapper;
    private final AlbumMapper albumMapper;
    private final PhotoMapper photoMapper;
    private final LogMapper logMapper;

    @Override
    public StatsVO getStats() {
        StatsVO vo = new StatsVO();
        // 文章总数仅统计已发布
        vo.setPostCount(postMapper.selectCount(
                new LambdaQueryWrapper<Post>().eq(Post::getPublished, true)));
        vo.setCommentCount(commentMapper.selectCount(null));
        vo.setAlbumCount(albumMapper.selectCount(null));
        vo.setPhotoCount(photoMapper.selectCount(null));
        vo.setTotalReadNum(sumReadNum());
        return vo;
    }

    @Override
    public List<ReadTrendVO> getReadTrend(int days) {
        int validDays = Math.clamp(days, 1, 30);
        LocalDateTime start = LocalDate.now().minusDays(validDays - 1).atStartOfDay();
        List<ReadTrendVO> rows = logMapper.selectReadTrend(start);
        Map<String, Long> countMap = rows.stream()
                .collect(Collectors.toMap(ReadTrendVO::getDate, ReadTrendVO::getCount));

        List<ReadTrendVO> result = new ArrayList<>(validDays);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = validDays - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dateStr = date.format(formatter);
            ReadTrendVO item = new ReadTrendVO();
            item.setDate(dateStr);
            item.setCount(countMap.getOrDefault(dateStr, 0L));
            result.add(item);
        }
        return result;
    }

    @Override
    public List<CreationTrendVO> getCreationTrend(int days) {
        int validDays = Math.clamp(days, 1, 30);
        LocalDateTime start = LocalDate.now().minusDays(validDays - 1).atStartOfDay();

        Map<String, Long> postMap = toCountMap(postMapper.selectCreationTrend(start));
        Map<String, Long> albumMap = toCountMap(albumMapper.selectCreationTrend(start));
        Map<String, Long> photoMap = toCountMap(photoMapper.selectCreationTrend(start));

        List<CreationTrendVO> result = new ArrayList<>(validDays);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = validDays - 1; i >= 0; i--) {
            String dateStr = LocalDate.now().minusDays(i).format(formatter);
            CreationTrendVO item = new CreationTrendVO();
            item.setDate(dateStr);
            item.setPostCount(postMap.getOrDefault(dateStr, 0L));
            item.setAlbumCount(albumMap.getOrDefault(dateStr, 0L));
            item.setPhotoCount(photoMap.getOrDefault(dateStr, 0L));
            result.add(item);
        }
        return result;
    }

    /**
     * 将按天计数列表转为 日期 -> 数量 的映射
     */
    private Map<String, Long> toCountMap(List<DateCountVO> rows) {
        return rows.stream()
                .collect(Collectors.toMap(DateCountVO::getDate, DateCountVO::getCount));
    }

    /**
     * 统计所有文章的阅读量总和，无数据时返回 0
     */
    private Long sumReadNum() {
        Object total = postMapper.selectObjs(
                new QueryWrapper<Post>().select("IFNULL(SUM(read_num), 0) AS total")
        ).stream().findFirst().orElse(0L);
        return ((Number) total).longValue();
    }
}
