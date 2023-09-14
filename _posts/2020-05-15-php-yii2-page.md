---
layout: post
title: yii2 如何优雅的将Pagination集成到model中去
tags: php yii2  
categories: backend
---

* TOC
{:toc}

# yii2 如何优雅的将Pagination集成到model中去

## 原因

* 正常情况下我们都需要, 而且其他model都需要重复,代码冗余太多，而且我也懒得记

  ```php
    $record = ActiveRecord::find();
    // 设置条件...
    $count = $record->count();
    $pg = new Pagination([
        'totalCount' => $count,
    ]);
    $rows = $record->offset($pg->offset)
          ->limit($pg->limit)
          ->all();
    return [
      'pageTotal' => $pg->totalCount,
      $pg->pageParam => $pg->getPage() + 1,
      $pg->pageSizeParam => $pg->getPageSize(),
      'rows' => $rows,
    ];
  ```

## 封装

* yii2 的Pagination 其实内置了request分页获取，所以不需要自己手动获取分页，而且我们返回分页内容格式应该是各个接口一致的。所以我们可以在```yii\db\ActiveQuery```类上做手脚.

  ```php
  namespace app\models;

  use yii\data\Pagination;
  use yii\db\ActiveQuery;

  class BaseActiveQuery extends ActiveQuery
  {
      /**
      * @var Pagination
      */
      protected $pagination;
      private $pageSizeParam = 'pageSize';

      public function generatePagination()
      {

          $this->pagination = new Pagination([
              'totalCount' => $this->count(),
              'pageSizeParam' => $this->pageSizeParam,
              //'defaultPageSize' => 1 ,
          ]);

          // 使用分页对象来填充 limit 子句并取得文章数据
          $this->offset($this->pagination->offset) 
                ->limit($this->pagination->limit);

          return $this;
      }


      public function getAllByPage()
      {
          $rows = $this->generatePagination()->all();
          $pg = $this->pagination;
          return [
              'totalCount' => $pg->totalCount,
              'totalPage' => $pg->getPageCount(),
              $pg->pageParam => $pg->getPage() + 1,
              $pg->pageSizeParam => $pg->getPageSize(),
              'rows' => $rows,
          ];
      }
  }

  # record 中的find方法中应该返回上面的BaseActiveQuery
  class ActiveRecord {

  }
  # 如此我们就可以
  $record = ActiveRecord::find();
  // 设置条件...
  $data = $record->getAllByPage();
  ```
