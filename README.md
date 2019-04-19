# floorplan控制与上传组件
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

基于leaflet，地图数据来源于osm。系统框架使用umi，UI使用antdesign

## 主要功能：
+ 1.获取osm建筑物数据并在底图上绘制建筑物边框
+ 2.建筑物点击之后显示floorplan上传功能
+ 3.floorplan上传之后在屏幕中心显示图片，并出现3个控制点（gcp）和一个中心点
+ 4.gcp实时显示在面板，面板上对gcp进行编辑也能反向控制floorplan的位置

## 服务器方案
+ 1.服务器接收传参之后将image转为GeoTiff格式保存，因为GeoTiff可将图片及坐标信息保存至一个文件
   - gdal_translate \
     -gcp 0 0 -0.16565322875976562 51.535124597854846 \
     -gcp 400 0 -0.1490020751953125 51.53709997281008 \
     -gcp 400 266 -0.1459980010986328 51.5257270458621 \
     input.jpg out.tif
     
+ 2.通过gdalwarp将out.tif文件进行坐标系映射，否则图片为原始样式，并不呈现变换调整后的效果
   - gdalwarp -t_srs EPSG:4326 out.tif out_geo.tif
 
+ 3.通过gdalwarp将out.geo.tif文件没有数据的黑边设成透明
   - gdalwarp -srcnodata 0 -dstalpha out_geo.tif out_geo_n.tif
   
+ 4.通过gdal2tiles.py将out_geo_n.tif文件进行切片
   - gdal2tiles.py -s EPSG:4326 -z 10-19 out_geo_n.tif tiles

## 示例
  ![图片丢失](https://raw.githubusercontent.com/summer-sky/floorplan/master/img.png)
