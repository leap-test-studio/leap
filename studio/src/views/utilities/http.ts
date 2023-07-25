import axios from "axios";

export function upload(method: string, url: string, data: FormData, progress: (percent: number) => void) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.ontimeout = reject;
    request.onerror = reject;

    request.onload = () => {
      resolve({
        status: request.status,
        text: () => Promise.resolve(request.responseText)
      });
    };

    request.upload.onprogress = (ev) => {
      let percent = (ev.loaded / ev.total) * 100;
      progress(percent);
    };

    request.open(method, url);
    request.send(data);
  });
}

export const downloadFile = async (url: string, name: string, contentType: string) => {
  const blob = await axios.get(url, {
    headers: {
      "Content-Type": contentType !== undefined ? contentType : "application/vnd.tcpdump.pcap"
    },
    responseType: "blob"
  });
  const a = document.createElement("a");
  const href = window.URL.createObjectURL(blob.data);
  a.href = href;
  a.download = name;
  a.click();
};
