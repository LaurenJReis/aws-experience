package com.senai.experience.DTO.request;

import com.senai.experience.entities.role.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;
import lombok.Data;

@Data
public class PessoaFisicaRequest {

    @NotBlank(message = "O nome não pode estar em branco.")
    @Size(min = 2, max = 100, message = "O nome deve conter entre 2 e 100 caracteres.")
    private String nome;

    @Email(message = "O e-mail informado é inválido.")
    @NotBlank(message = "O e-mail não pode estar em branco.")
    private String email;

    @NotBlank(message = "A senha não pode estar em branco.")
    @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres.")
    private String senha;

    @NotNull(message = "A data de nascimento é obrigatória.")
    private LocalDate dataNascimento;

    @CPF(message = "O CPF informado é inválido.")
    @NotBlank(message = "O CPF não pode estar em branco.")
    private String cpf;

    // Campo ignorado no cadastro público — o mapper sempre define CLIENTE
    private UserRole role;
}
