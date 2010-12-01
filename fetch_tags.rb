require 'rubygems'
require 'mp3info'
require 'json'

def calc_duration(info)
  l = info.length
  mins = l.divmod(60)

  if mins[0] == 0
    min = mins[0]
    sec = mins[1].round
  else
    min = mins[0]
    sec = mins[1].round
  end

  (min * 60 + sec) * 1000
end


info = Mp3Info.open(ARGV[0], :encoding => 'utf-8')

puts({
  :duration => calc_duration(info),
  :title    => info.tag2['TT2'],
  :author   => info.tag2['TP1'],
  :tags     => info.tag2['TCM'],
  :album    => info.tag2['TAL'],
  :ganre    => info.tag2['TCO']
}.to_json)
