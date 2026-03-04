FROM ubuntu:24.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get -y install \
        build-essential \
        curl \
        gdb \
        less \
        git \
        unzip \
        zsh && \
    rm -rf /var/lib/apt/lists/*

SHELL [ "/bin/zsh", "-o", "pipefail", "-c" ]

COPY .p10k.zsh /root

RUN curl -o- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh | zsh && \
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k" && \
    sed -i 's/ZSH_THEME="robbyrussell"/ZSH_THEME="powerlevel10k\/powerlevel10k"/' $HOME/.zshrc && \
    echo "[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh" >> $HOME/.zshrc

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash && \
    sed -i 's/plugins=(git)/plugins=(git nvm)/' $HOME/.zshrc && \
    echo "export NODE_OPTIONS=--max_old_space_size=4096" >> $HOME/.zshrc && \
    . $HOME/.zshrc && \
    nvm install v20

COPY .npmrc /root

ENV VCPKG_ROOT=/root/.vcpkg

RUN . <(curl https://aka.ms/vcpkg-init.sh -L) && \
    echo ". ~/.vcpkg/vcpkg-init" >> $HOME/.zshrc

CMD ["/bin/zsh"]
