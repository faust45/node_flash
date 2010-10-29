#!/bin/bash

convert $1 \( +clone  -alpha extract         -draw 'fill black polygon 0,0 0,6 6,0 fill white circle 6,6 6,0'         \( +clone -flip \) -compose Multiply -composite         \( +clone -flop \) -compose Multiply -composite      \) -alpha off -compose CopyOpacity -composite $2
