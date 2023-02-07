# ESDiPi

SDP Compression Algorithm for WebRTC

This packages provides a modified implementation of the article
[SDP Compression Algorithm for WebRTC: ESDiPi](<SDP Compression Algorithm for WebRTC - ESDiPi.pdf>)
by [Adem Atalay](mailto:adema@netas.com.tr) and Doğaç Başaran, published in the
*International Journal of Computer and Electrical Engineering* vol. 8, no. 1,
pp. 77-83, 2016. This implementation includes a hand-optimized prefix string not defined in the article, and also changed the fields sizes for the
*<offset,length> pair*s to allow use bigger prefix strings at the cost of having
shorter, more real-life alike copies lengths.

## CLI usage

### Clean SDP

```sh
cat test/sdp/offer.sdp | ./server.js clean-sdp > test/sdp/offer.esdipi
```

### Compress

```sh
cat test/sdp/offer.sdp | ./server.js compress lossy > test/sdp/offer.esdipi
```

### Decompress

```sh
cat test/sdp/offer.esdipi | ./server.js decompress > test/sdp/offer.sdp
```

### Prefix

```sh
./server.js prefix > test/sdp/offer.esdipi
```
