# Sun Ya OID Pen Reverse Engineer

The [Sun Ya OID pen](https://e.sunya.com.hk/tc/page.php?id=32) [(manual)](https://e.sunya.com.hk/uploader/upload/file/pointpen/sunya_pen_manual.pdf) is a generally available OID (Optical ID) pen for the [新雅點讀樂園 ecosystem of products](https://e.sunya.com.hk/tc/page.php?id=30).

[You can download the entirety of the pen's assets from the Sun Ya website:](https://e.sunya.com.hk/download/readingpen/)

```sh
wget -r -np -nd -A zip,pdf --no-check-certificate --directory-prefix=assets --remote-encoding=utf-8 https://e.sunya.com.hk/download/readingpen/ 
```

## File Format

The Sun Ya pen's file format is `.tid`. It is a custom binary format.

### Header

The header is 280 bytes long and starts at `0x00`. It has the following structure:

| Address | Endian | Length | Description |
|---|---|---|---|
| 0x00 | Big Endian | 32 bytes | Editor tag. Always: ` ZHHC GernealOIDDataLinker V2.01` |
| 0x7C | Little Endian | uint32 | Book ID. Starting from `49000`. |
| 0x80 | Unknown | 4 bytes | Unknown. `0x07442FBA`, only appears in book ID `49000` (新雅幼兒互動點讀圖典及拼字套裝).
| 0x84 | Big Endian | uint32 | File size in bytes. This field represents the overall file size, but it is actually 2,000 bytes less than the file size. |
| 0x110 | Little Endian | uint32 | Array length. This specifies the element count of an array structure. |
| 0x114 | Little Endian | uint32 | Starting OID numeric code. |

Fields `0x110` and `0x114` always add up to 68,090 or 68,091 (one of these is likely an off-by-one and needs investigation) implying that this is the maximum number of OID codes addressable per series ID namespace.

### Body

The body starts at `0x118` and has a variable length. It is made up of the following elements:

#### 1. Array of Pointers to MP3 Address and Length Structs by Language

This section starts at `0x118` and has a variable length. The length of this section is calculated by `7 bytes * uint32(littleEndian(0x110))`. Each array element has the following structure:

| Endian | Length | Description |
|---|---|---|
| Unknown | 3 bytes | Unknown. Always `0x́010300`.
| Big Endian | uint32 | Pointer. An address within the file to a struct that contains three languages worth of MP3 address and length information. |

If there is no value present the whole struct is 7 bytes of `0xFF`.

The indices in this array are used to identify which OID numeric code to use. The OID numeric code is the value of the field at `0x114` + the index number in this array. Some of these items map to control and guidance audio that are not book-specific.

#### 2. MP3 Files

The MP3 section starts directly following the array of pointers to MP3 Address and Length and is of variable length.

The MP3 files are directly concatenated with no separators. The contents of the section are not in any particular order, and it is likely possible to relocate arbitrarily. ID3 tags and other metadata appears inline so it is presumably an arbitrarily concatenated collection of MP3 files.

The MP3 frame headers are all either `0xFFFB50C4` or `0xFFFB52C4`. That means they're all encoded at:
- 64 bps
- 44100 Hz
- mono

#### 3. Array of MP3 Address and Length Structs by Language

Following the MP3s there is an array of structs that store address and length by language. The start of this section is is variable. The length of this section is variable. Indexing into this array is done via direct addressing from the array of addresses in the first section.

This segment is described by the following struct:

| Endian | Length | Language | Description |
|---|---|---|---|
| Big Endian | uint32 | Cantonese | Pointer. The address within the file that the MP3 starts. |
| Big Endian | uint32 | Cantonese | Length. The length in bytes of the MP3 stored at that address. |
| Big Endian | uint32 | English | Pointer. The address within the file that the MP3 starts. |
| Big Endian | uint32 | English | Length. The length in bytes of the MP3 stored at that address. |
| Big Endian | uint32 | Mandarin | Pointer. The address within the file that the MP3 starts. |
| Big Endian | uint32 | Mandarin | Length. The length in bytes of the MP3 stored at that address. |

If sorted and deduplicated the array describes the continuous range that is the MP3 portion of the file. For example:

| Address (decimal) | Length (decimal) | Sum (decimal) |
|---|---|---|
| 390012 | 86308 | 476320 |
| 476320 | 1671 | 477991 |
| 477991 | 94458 | 572449 |
| 572449 | 9822 | 582271 |
| 582271 | 9870 | 592141 | 
| 592141 | ... | ... |

#### 4. Trailing Bytes

1. For book ID `49000` the file ends with a whole bunch of additional sections. Further investigation is required.
2. For books other than ID `49000` each file ends with 395,216 bytes of `0xFF`.

## Creating A New Series

TODO: This section should describe how to create a new series, starting from scratch with a root book ID (e.g. `49000`).

(NOTE: It is unclear if this is possible without adjusting the pen's firmware.)

## Creating New Books

TODO: This section should describe how to create a new book for any existing series.

## Printing New Codes

TODO: This section should describe how to print the associated codes for a book in a particular series.