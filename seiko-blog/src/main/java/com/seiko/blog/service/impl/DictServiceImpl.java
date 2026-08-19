package com.seiko.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.seiko.blog.dto.DictItemDTO;
import com.seiko.blog.dto.DictTypeDTO;
import com.seiko.blog.entity.DictItem;
import com.seiko.blog.entity.DictType;
import com.seiko.blog.mapper.DictItemMapper;
import com.seiko.blog.mapper.DictTypeMapper;
import com.seiko.blog.service.DictService;
import com.seiko.blog.vo.DictItemVO;
import com.seiko.blog.vo.DictTypeVO;
import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 字典服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DictServiceImpl implements DictService {

    private final DictTypeMapper dictTypeMapper;
    private final DictItemMapper dictItemMapper;

    // ─── 字典类型 ───

    @Override
    public Page<DictTypeVO> getTypePage(long page, long size, String keyword, Boolean enabled) {
        Page<DictType> typePage = new Page<>(page, size);
        LambdaQueryWrapper<DictType> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            String kw = keyword.trim();
            wrapper.and(w -> w.like(DictType::getTypeCode, kw).or().like(DictType::getTypeName, kw));
        }
        if (enabled != null) {
            wrapper.eq(DictType::getEnabled, enabled);
        }
        wrapper.orderByAsc(DictType::getSortOrder).orderByDesc(DictType::getId);

        Page<DictType> result = dictTypeMapper.selectPage(typePage, wrapper);
        List<DictTypeVO> voList = result.getRecords().stream()
                .map(this::convertTypeToVO)
                .collect(Collectors.toList());

        Page<DictTypeVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);
        return voPage;
    }

    @Override
    public DictTypeVO getTypeById(Long id) {
        DictType type = getTypeEntity(id);
        return convertTypeToVO(type);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createType(DictTypeDTO dto) {
        String typeCode = dto.getTypeCode().trim();
        if (countTypeByCode(typeCode) > 0) {
            throw new BusinessException(500, "字典类型编码已存在");
        }

        DictType type = new DictType();
        BeanUtils.copyProperties(dto, type);
        type.setTypeCode(typeCode);
        type.setTypeName(dto.getTypeName().trim());
        type.setEnabled(dto.getEnabled() == null || dto.getEnabled());
        type.setSortOrder(dto.getSortOrder() == null ? 0 : dto.getSortOrder());
        dictTypeMapper.insert(type);
        log.info("新建字典类型: {} - {}", type.getTypeCode(), type.getTypeName());
        return type.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateType(Long id, DictTypeDTO dto) {
        DictType type = getTypeEntity(id);
        String typeCode = dto.getTypeCode().trim();
        if (!typeCode.equals(type.getTypeCode())) {
            if (countTypeByCode(typeCode) > 0) {
                throw new BusinessException(500, "字典类型编码已存在");
            }
        }

        BeanUtils.copyProperties(dto, type);
        type.setId(id);
        type.setTypeCode(typeCode);
        type.setTypeName(dto.getTypeName().trim());
        type.setEnabled(dto.getEnabled() == null || dto.getEnabled());
        type.setSortOrder(dto.getSortOrder() == null ? 0 : dto.getSortOrder());
        return dictTypeMapper.updateById(type) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteType(Long id) {
        DictType type = getTypeEntity(id);
        // 级联逻辑删除该类型下的全部字典项
        dictItemMapper.delete(new LambdaQueryWrapper<DictItem>().eq(DictItem::getTypeCode, type.getTypeCode()));
        boolean deleted = dictTypeMapper.deleteById(id) > 0;
        log.info("删除字典类型: {} - {}", type.getTypeCode(), type.getTypeName());
        return deleted;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateTypeEnabled(Long id, Boolean enabled) {
        DictType type = getTypeEntity(id);
        type.setEnabled(enabled);
        return dictTypeMapper.updateById(type) > 0;
    }

    // ─── 字典项 ───

    @Override
    public Page<DictItemVO> getItemPage(long page, long size, String typeCode, String keyword, Boolean enabled) {
        if (typeCode == null || typeCode.isBlank()) {
            throw new BusinessException(ResultCode.PARAM_ERROR);
        }

        Page<DictItem> itemPage = new Page<>(page, size);
        LambdaQueryWrapper<DictItem> wrapper = new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getTypeCode, typeCode.trim());
        if (keyword != null && !keyword.isBlank()) {
            String kw = keyword.trim();
            wrapper.and(w -> w.like(DictItem::getItemLabel, kw).or().like(DictItem::getItemValue, kw));
        }
        if (enabled != null) {
            wrapper.eq(DictItem::getEnabled, enabled);
        }
        wrapper.orderByAsc(DictItem::getSortOrder).orderByAsc(DictItem::getId);

        Page<DictItem> result = dictItemMapper.selectPage(itemPage, wrapper);
        List<DictItemVO> voList = result.getRecords().stream()
                .map(this::convertItemToVO)
                .collect(Collectors.toList());

        Page<DictItemVO> voPage = new Page<>();
        BeanUtils.copyProperties(result, voPage);
        voPage.setRecords(voList);
        return voPage;
    }

    @Override
    public DictItemVO getItemById(Long id) {
        DictItem item = getItemEntity(id);
        return convertItemToVO(item);
    }

    @Override
    public List<DictItemVO> getItemOptions(String typeCode) {
        if (typeCode == null || typeCode.isBlank()) {
            throw new BusinessException(ResultCode.PARAM_ERROR);
        }
        List<DictItem> items = dictItemMapper.selectList(new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getTypeCode, typeCode.trim())
                .eq(DictItem::getEnabled, true)
                .orderByAsc(DictItem::getSortOrder)
                .orderByAsc(DictItem::getId));
        return items.stream()
                .map(this::convertItemToVO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createItem(DictItemDTO dto) {
        String typeCode = dto.getTypeCode().trim();
        ensureTypeExists(typeCode);
        ensureItemValueUnique(typeCode, dto.getItemValue().trim(), null);

        DictItem item = new DictItem();
        BeanUtils.copyProperties(dto, item);
        item.setTypeCode(typeCode);
        item.setItemLabel(dto.getItemLabel().trim());
        item.setItemValue(dto.getItemValue().trim());
        item.setEnabled(dto.getEnabled() == null || dto.getEnabled());
        item.setSortOrder(dto.getSortOrder() == null ? 0 : dto.getSortOrder());
        item.setIsDefault(Boolean.TRUE.equals(dto.getIsDefault()));

        if (Boolean.TRUE.equals(item.getIsDefault())) {
            clearDefault(typeCode);
        }
        dictItemMapper.insert(item);
        log.info("新建字典项: {}.{} = {}", typeCode, item.getItemValue(), item.getItemLabel());
        return item.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateItem(Long id, DictItemDTO dto) {
        DictItem item = getItemEntity(id);
        String typeCode = dto.getTypeCode().trim();
        ensureTypeExists(typeCode);
        ensureItemValueUnique(typeCode, dto.getItemValue().trim(), id);

        BeanUtils.copyProperties(dto, item);
        item.setId(id);
        item.setTypeCode(typeCode);
        item.setItemLabel(dto.getItemLabel().trim());
        item.setItemValue(dto.getItemValue().trim());
        item.setEnabled(dto.getEnabled() == null || dto.getEnabled());
        item.setSortOrder(dto.getSortOrder() == null ? 0 : dto.getSortOrder());
        item.setIsDefault(Boolean.TRUE.equals(dto.getIsDefault()));

        if (Boolean.TRUE.equals(item.getIsDefault())) {
            clearDefault(typeCode);
        }
        return dictItemMapper.updateById(item) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteItem(Long id) {
        DictItem item = getItemEntity(id);
        boolean deleted = dictItemMapper.deleteById(id) > 0;
        log.info("删除字典项: {}.{} = {}", item.getTypeCode(), item.getItemValue(), item.getItemLabel());
        return deleted;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateItemEnabled(Long id, Boolean enabled) {
        DictItem item = getItemEntity(id);
        item.setEnabled(enabled);
        return dictItemMapper.updateById(item) > 0;
    }

    // ─── 私有方法 ───

    private DictType getTypeEntity(Long id) {
        DictType type = dictTypeMapper.selectById(id);
        if (type == null || type.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return type;
    }

    private DictItem getItemEntity(Long id) {
        DictItem item = dictItemMapper.selectById(id);
        if (item == null || item.getIsDeleted() == 1) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return item;
    }

    private long countTypeByCode(String typeCode) {
        return dictTypeMapper.selectCount(new LambdaQueryWrapper<DictType>()
                .eq(DictType::getTypeCode, typeCode));
    }

    private void ensureTypeExists(String typeCode) {
        if (countTypeByCode(typeCode) == 0) {
            throw new BusinessException(500, "字典类型不存在");
        }
    }

    private void ensureItemValueUnique(String typeCode, String itemValue, Long excludeId) {
        LambdaQueryWrapper<DictItem> wrapper = new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getTypeCode, typeCode)
                .eq(DictItem::getItemValue, itemValue);
        if (excludeId != null) {
            wrapper.ne(DictItem::getId, excludeId);
        }
        if (dictItemMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(500, "该类型下已存在相同值的字典项");
        }
    }

    /** 清除某类型下所有字典项的默认标记 */
    private void clearDefault(String typeCode) {
        dictItemMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<DictItem>()
                .eq(DictItem::getTypeCode, typeCode)
                .set(DictItem::getIsDefault, false));
    }

    private DictTypeVO convertTypeToVO(DictType type) {
        if (type == null) {
            return null;
        }
        DictTypeVO vo = new DictTypeVO();
        vo.setId(type.getId());
        vo.setTypeCode(type.getTypeCode());
        vo.setTypeName(type.getTypeName());
        vo.setRemark(type.getRemark());
        vo.setEnabled(type.getEnabled());
        vo.setSortOrder(type.getSortOrder());
        vo.setCreateTime(type.getCreateTime());
        vo.setItemCount(dictItemMapper.selectCount(new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getTypeCode, type.getTypeCode())));
        return vo;
    }

    private DictItemVO convertItemToVO(DictItem item) {
        if (item == null) {
            return null;
        }
        DictItemVO vo = new DictItemVO();
        vo.setId(item.getId());
        vo.setTypeCode(item.getTypeCode());
        vo.setItemLabel(item.getItemLabel());
        vo.setItemValue(item.getItemValue());
        vo.setItemTag(item.getItemTag());
        vo.setIsDefault(item.getIsDefault());
        vo.setEnabled(item.getEnabled());
        vo.setSortOrder(item.getSortOrder());
        vo.setCreateTime(item.getCreateTime());
        return vo;
    }
}
