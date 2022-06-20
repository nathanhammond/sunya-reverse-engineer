# Sun Ya OID Pen Reverse Engineer

The [Sun Ya OID pen](https://e.sunya.com.hk/tc/page.php?id=32) [(manual)](https://e.sunya.com.hk/uploader/upload/file/pointpen/sunya_pen_manual.pdf) is a generally available OID (Optical ID) pen for the [新雅點讀樂園 ecosystem of products](https://e.sunya.com.hk/tc/page.php?id=30).

You can download the entirety of the pen's assets from the Sun Ya website:
- [Book Series](https://e.sunya.com.hk/download/readingpen/)
- [Jumping Bean](https://e.sunya.com.hk/download/jumpingbean/)

```sh
wget -r -np -nd -A tid,zip,pdf,mp3 --no-check-certificate --directory-prefix=assets/readingpen --remote-encoding=utf-8 https://e.sunya.com.hk/download/readingpen/
wget -r -np -nd -A tid,zip,pdf,mp3 --no-check-certificate --directory-prefix=assets/jumpingbean --remote-encoding=utf-8 https://e.sunya.com.hk/download/jumpingbean/
```

## `.tid` File Format

The Sun Ya pen's file format is `.tid`. It is a custom binary format.

### Header

The header is 280 bytes long and starts at `0x00`. It has the following structure:

| Address | Endian | Length | Description |
|---|---|---|---|
| `0x00` | Big Endian | 32 bytes | Editor tag. For example: ` ZHHC GernealOIDDataLinker V2.01` |
| `0x7C` | Little Endian | uint32 | Book ID. Starting from `49000`. |
| `0x80` | Big Endian | 4 bytes | Second Section start. Only appears in book ID `49000` (新雅幼兒互動點讀圖典及拼字套裝).
| `0x84` | Big Endian | uint32 | File size in bytes. This field represents the overall file size, but it is actually 2,000 bytes less than the file size. |
| `0x110` | Little Endian | uint32 | Array length. This specifies the element count of the array directly following the header. |
| `0x114` | Little Endian | uint32 | Starting OID numeric code. |

Fields `0x110` and `0x114` always add up to `68090` or `68091`, with the `68091` being a harmless off-by-one error.

### Body

The body starts at `0x118` and has a variable length. It is made up of the following elements:

#### 1. Array of Pointers to MP3 Address and Length Structs by Language

This section starts at `0x118` and has a variable length. The length of this section is calculated by `7 bytes * uint32(littleEndian(0x110))`. Each array element has the following structure:

| Endian | Length | Description |
|---|---|---|
| Unknown | 3 bytes | Unknown. Always `0x́010300`. Possible that this specifies how many languages are available in the target structure.
| Big Endian | uint32 | Pointer. An address within the file to a struct that contains three languages worth of MP3 address and length information. |

If there is no value present the whole struct is 7 bytes of `0xFF`.

The indices in this array are used to identify which OID numeric code to use. The OID numeric code is the value of the field at `0x114` + the index number in this array. Some of these items map to control and guidance audio that are not book-specific:
- The book name is stored at the code which corresponds to its book ID.
- `52000` through (at least) `52102` are used for system codes.
- `68000` through `68090` are used for system codes.

#### 2. MP3 Files

The MP3 section starts directly following the array of pointers to MP3 Address and Length Structs by Language and is of variable length.

The MP3 files are directly concatenated with no separators. The contents of the section are not in any particular order, and it is likely possible to relocate arbitrarily. ID3 tags and other metadata appear inline.

The MP3 processor appears to support a large combination of MPEG versions and bitrates as the existing `.tid` files from Sun Ya are extremely inconsistent.

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

#### 4. (`49000` only) Second Header

Beginning from the address specified at `0x80` there is an additional set of header-like content:

| Endian | Length | Description |
|---|---|---|
| Little Endian | uint16 | Array length. (50144) |
| Little Endian | uint16 | Starting ID. (2000) |
| N/A | 2 bytes | 0x0000 |

#### 5. (`49000` only) Second Body

The array length from the second header specifies an array length which is populated by this 

| Endian | Length | Description |
|---|---|---|
| Big Endian | uint32 | Pointer. |
| Little Endian | uint16 | Length. |

#### 6. (`49000` only) Separator

The array is followed by a 6 byte field.

| Endian | Length | Description |
|---|---|---|
| N/A | 6 bytes | 0x000000 |

#### 7. (`49000` only) More MP3s

Section 2 starts at: 85322109
Array items start at: 85322114
Array items end at: 85622978
MP3s start at: 85622979
35369

#### 8. (`49001+` only) Trailing Bytes

For books other than ID `49000` each file ends with 395,216 bytes of `0xFF`.

***

## `SystemInfo.bin` File Format

`SystemInfo.bin` appears in a directory named `REMINDER` on the pen. It is 256 bytes long. `0x65` - `0x6A` may represent boolean flags. `0x6B` (`0x68BF`) is a Little Endian `uint16` which is `49000`.

|    | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 0A | 0B | 0C | 0D | 0E | 0F |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| 10 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| 20 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| 30 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| 40 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| 50 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| 60 | 00 | 00 | 00 | 00 | 00 | **01** | **01** | **01** | **01** | **01** | **01** | **68** | **BF** | 00 | 00 | 00 |
| 70 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| 80 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| 90 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| A0 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| B0 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| C0 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| D0 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| E0 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
| F0 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |

## `tidfiles.lst` File Format

`tidfiles.lst` appears in a directory named `REMINDER` on the pen. This file serves as a directory of which file to load for a particular code. It maps the book codes to which file needs to be loaded in order to play their sounds.

### Header

| Address | Endian | Length | Description |
|---|---|---|---|
| 0x00 | Little Endian | uint16 | Count of `.tid` files on the pen.

This length was 85 for mine, but there were only 82 elements.

### Book Information

| Endian | Length | Description |
|---|---|---|
| Little Endian | uint16 | The book ID.
| Little Endian | uint16 | Unknown. When set is `0x3D00` or `61` in decimal.
| Little Endian | uint32 | The code start ID.
| Little Endian | uint32 | The last ID that the `.tid` provides.
| Little Endian | uint16 | The book ID, again.
| Little Endian | wchar_t(130) | A `\000`-terminated UTF16 string representing the file path, maximum 260 bytes. `A:/BOOKS/<FILENAME>.tid\000`

Notable weirdness:
- For `49000` the lastId is `4000015` instead of `68090` like all others.
- The noncontiguous `5654` and `5664` exist as book IDs.

## Creating A New Series

TODO: This section should describe how to create a new series, starting from scratch with a root book ID (e.g. `49000`).

## Creating New Books

TODO: This section should describe how to create a new book for any existing series.

## Printing New Codes

TODO: This section should describe how to print the associated codes for a book in a particular series.