package com.seiko.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.DictItemDTO;
import com.seiko.blog.dto.DictTypeDTO;
import com.seiko.blog.vo.DictItemVO;
import com.seiko.blog.vo.DictTypeVO;

import java.util.List;

/**
 * 字典服务接口
 */
public interface DictService {

    /**
     * 分页查询字典类型
     *
     * @param page    页码
     * @param size    每页大小
     * @param keyword 类型编码/名称模糊查询
     * @param enabled 启用状态过滤
     * @return 字典类型分页
     */
    Page<DictTypeVO> getTypePage(long page, long size, String keyword, Boolean enabled);

    /**
     * 查询字典类型详情
     *
     * @param id 类型ID
     * @return 字典类型
     */
    DictTypeVO getTypeById(Long id);

    /**
     * 新建字典类型
     *
     * @param dto 请求体
     * @return 新类型ID
     */
    Long createType(DictTypeDTO dto);

    /**
     * 更新字典类型
     *
     * @param id  类型ID
     * @param dto 请求体
     */
    Boolean updateType(Long id, DictTypeDTO dto);

    /**
     * 删除字典类型（级联逻辑删除其下字典项）
     *
     * @param id 类型ID
     */
    Boolean deleteType(Long id);

    /**
     * 更新字典类型启用状态
     *
     * @param id      类型ID
     * @param enabled 是否启用
     */
    Boolean updateTypeEnabled(Long id, Boolean enabled);

    /**
     * 分页查询字典项
     *
     * @param page     页码
     * @param size     每页大小
     * @param typeCode 所属类型编码
     * @param keyword  标签/值模糊查询
     * @param enabled  启用状态过滤
     * @return 字典项分页
     */
    Page<DictItemVO> getItemPage(long page, long size, String typeCode, String keyword, Boolean enabled);

    /**
     * 查询某类型下全部启用中的字典项（用于下拉选项与展示映射）
     *
     * @param typeCode 类型编码
     * @return 启用中的字典项列表
     */
    List<DictItemVO> getItemOptions(String typeCode);

    /**
     * 查询字典项详情
     *
     * @param id 字典项ID
     * @return 字典项
     */
    DictItemVO getItemById(Long id);

    /**
     * 新建字典项
     *
     * @param dto 请求体
     * @return 新字典项ID
     */
    Long createItem(DictItemDTO dto);

    /**
     * 更新字典项
     *
     * @param id  字典项ID
     * @param dto 请求体
     */
    Boolean updateItem(Long id, DictItemDTO dto);

    /**
     * 删除字典项
     *
     * @param id 字典项ID
     */
    Boolean deleteItem(Long id);

    /**
     * 更新字典项启用状态
     *
     * @param id      字典项ID
     * @param enabled 是否启用
     */
    Boolean updateItemEnabled(Long id, Boolean enabled);
}
