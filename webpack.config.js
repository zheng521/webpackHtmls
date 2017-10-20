const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

// 第三方模块
const glob = require('glob');


// webpack 插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')

// postcss
const autoprefixer = require('autoprefixer')

const entries = glob.sync(
	'**/*.js',
	{
		cwd: path.join(__dirname, 'src', 'js'),
		ignore: [
			'common/*.js'
		]
	}
);

// 定义去除文件后缀名的方法
const removeExtension = function (filename) {
	return filename.substr(0, filename.lastIndexOf('.') || filename)
}

// 生成符合webpack规则的entries
const webpackEntries = {};

// 保证一个页面一个HTML
const htmlWebpackPluginArr = [];

// 样式独立打包
const extractLESS = new ExtractTextPlugin(`css/[name].style.css?ver=[hash]`);

// 遍历所有匹配的js页面
entries.forEach((value) => {
	// 去除后缀，利于匹配和生成文件
	const resourcePath = removeExtension(value);

	// 资源入数组
	webpackEntries[resourcePath] = ['./' + path.join('src', 'js', value)];

	// 引入通用less
	// webpackEntries['common/reset'] = ['./' + path.join('src', 'less', 'commom', 'reset.less')];

	htmlWebpackPluginArr.push(
		new HtmlWebpackPlugin({
			// 一次只能生成一个 html 文件...
			filename: path.join('template', `${resourcePath}.html`),
			// 获取模板文件
			template: path.resolve(__dirname, 'src', 'index.html'),
			// 每个html引入自己私有的资源文件
            // 如果不配置会把entry所有文件都引入
            // inject默认true，如果false会所有资源文件都不引入
			chunks: [`${resourcePath}`]
		})
	)

})

module.exports = {
	resolve: {
		alias: {
			'vue': 'vue/dist/vue.js'
		}
	},
	entry: webpackEntries,
	output: {
		// 输出目录，没有则新建
		path: path.resolve(__dirname, './dist'),
		// 静态资源路径
		publicPath: '/webpackHtmls/dist/',
		// 文件名
		filename: `js/[name].js?ver=[hash]`
	},
	module: {
		rules: [
			// 用来解析vue后缀的文件
            {
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						'sass': 'vue-style-loader!css-loader!sass-loader',
					}
				}
			},
			// 用babel 解析js文件并把es6的语法转换成浏览器认识的语法
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.(less|css)$/,
				use: extractLESS.extract(
					{
						fallback: 'style-loader',
						use: [
							'css-loader',
							'postcss-loader',
							'less-loader'
						]
					}
				)
			},
			{
				test: /\.(jpe?g|png|gif|mp4|ttc|otf|ttf|woff)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'images/[name].[ext]',
						}
					}
				]
			}
		]
	},
	plugins: [
		...htmlWebpackPluginArr,
		extractLESS
	],
	devServer: {
        contentBase: './dist',
        historyApiFallback: true,
        inline: true,
        host: '0.0.0.0',
        disableHostCheck: true
    }
}
