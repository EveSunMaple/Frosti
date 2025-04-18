---
draft: true
title: "[C语言] 文件读取结束的判定"
pubDate: "2022-03-28"
description: "当我们对一个文件的数据进行读取, 输入到内存中的时候, 无论是读取文件数据正常结束, 还是读取文件数据失败了, 函数都会返回一个值"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251812483.webp
categories: ['tech']
tags: ["C语言", "文件"]
---

# 文件读取结束的判定

当我们对一个文件的数据进行读取, 输入到内存中的时候, 无论是读取文件数据正常结束, 还是读取文件数据失败了, 函数都会返回一个值。

对于一般的文本文件: 

>  以 `fgetc 字符输入函数 `读取: 
>
> > 读取文件数据结束 或者 读取文件数据失败 就会返回 `EOF`
>
>  以 `fgets 文本行输入函数` 读取: 
>
> > 读取文件数据结束 或者 读取文件数据失败 就会返回 `NULL`

对于二进制文件: 

> 以 `fread 二进制输入函数` 读取: 
>
> > 读取文件结束 就会返回 最后一次读取到的数据的个数

##  被大家错误使用的 `feof`

文件读取结束, 有可能是 读取失败结束,  也有可能是读取到结尾后结束。但是文件读取函数, 无论是以那种方式结束, 函数的返回值都是一样的。很可能就无法判断, 文件的读取到底是如何结束的。

所以, 就要使用到两个 用来判定文件读取结束方式 的函数 

`feof` 和 `ferror`

---



### `feof`

```C
int feof( FILE *stream );
```

当文件读取结束后, 可以将 文件指针(文件流), 传入 `feof` 函数, 然后以 `feof` 的返回值来判断 文件读取是否属于 非读取失败 结束的。

 `feof` 的返回值只有 `0` 和 `非零值`

> 当 文件读取 属于正常的读取到末尾结束的 , `feof` 就返回一个 `非零值`
>
> 当 文件读取 还没有读取到末尾,  `feof` 就返回 `0`
>
> 当 文件读取 属于读取失败结束的,  `feof` 无返回

但是, 对于 `feof` 许多人将其用于 判断文件的读取是否结束, 而不是用于 判读文件读取是以哪种方式结束的

其实, `feof` 真正正确的用法是,  在已经知道文件读取结束(已经读取失败(错误), 或是已经读取到文件数据的末尾)的情况下, 用 `feof` 判断文件读取是否是 正常的读取结束

而 `ferror` 函数, 则是用来判断 文件读取 是否属于 读取失败结束

### `ferror`

```C
int ferror( FILE *stream );
```

`ferror` 和 `feof` , 两个函数一般结合使用

当 文件读取已经结束(已经读取失败(错误), 或是已经读取到文件数据的末尾)的情况下, 将 `文件指针(文件流)` 分别传入 `ferror` 和 `feof` , 通过判断 两个函数的返回值, 来判断文件读取结束的方式。

`ferror` 的返回值同样也只有 `0` 和 `非零值`

> 当 文件读取 属于正常的 读取到末尾结束的,  `ferror` 就返回 `0`
>
> 当 文件读取 属于读取失败(错误)结束的,  `ferror` 就返回一个 `非零值`



大家可以用下面的两段代码（也可以根据自己的经验, 知识稍作修改）试验一下

>对于文本文件: 
>
>```C
>#include <stdio.h>
>#include <stdlib.h>
>
>int main()
>{
>	int c; // 注意: int, 非char, 要求处理EOF
>	FILE* pf = fopen("test.txt", "r");
>	if(pf == NULL)
>    {
>		perror("File opening failed");
>		return 0;
>	}
>	//fgetc 当读取失败的时候或者遇到文件结束的时候, 都会返回EOF
>	while ( (c = fgetc(pf)) != EOF) // 标准C I/O读取文件循环
>	{
>		putchar(c);
>	}
>    
>    //判断是什么原因结束的
>	if (ferror(pf))
>		puts("I/O error when reading");
>	else if (feof(pf))
>		puts("End of file reached successfully");
>    
>	fclose(pf);
>    pf = NULL;
>    
>    return 0;
>}
>```
>
>对于二进制文件: 
>
>```C
>#include <stdio.h>
>
>int main()
>{
>	double a[5] = { 1.0, 2.0, 3.0, 4.0, 5.0 };
>	FILE *pf = fopen("test.bin", "wb"); // 必须用二进制模式
>    	if(pf == NULL)
>    	{
>		perror("File opening failed");
>		return 0;
>	}
>	fwrite(a, sizeof (*a), SIZE, pf); // 写 double 的数组
>	fclose(pf);
>    	pf = NULL;
>    
>	double b[5];
>	pf = fopen("test.bin","rb");
>	size_t ret_code = fread(b, sizeof (*b), 5, pf); // 读 double 的数组
>    	if(pf == NULL)
>    	{
>		perror("File opening failed");
>		return 0;
>	}
>	if(ret_code == 5)
>    	{
>		puts("Array read successfully, contents: ");
>		for(int n = 0; n < SIZE; ++n)
>         	printf("%f ", b[n]);
>		putchar('\n');
>	}
>    	else
>    	{ // error handling
>		if (feof(pf))
>        		{//判断是否正常结束
>        			printf("Error reading test.bin: unexpected end of file\n");   
>        		}
>		else if (ferror(pf))
>        		{//判断是否遇到错误结束
>			perror("Error reading test.bin");
>		}
>	}
>    
>	fclose(pf);
>    	pf = NULL;
>    
>    	return 0;
>}	
>```
>
>可以修改一下, 使两个函数 都生效以下~